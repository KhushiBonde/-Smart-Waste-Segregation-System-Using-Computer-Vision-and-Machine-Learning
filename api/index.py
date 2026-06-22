import os
import json
import io
import datetime
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil

app = FastAPI(title="Smart Waste Segregation API")

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load TFLite Model
tflite = None
try:
    import tensorflow.lite as tf_lite
    tflite = tf_lite
except ImportError:
    try:
        import importlib
        tflite = importlib.import_module("ai_edge_litert.interpreter")
    except ImportError:
        try:
            import importlib
            tflite = importlib.import_module("tflite_runtime.interpreter")
        except ImportError:
            raise RuntimeError("Neither tensorflow.lite, ai_edge_litert.interpreter, nor tflite_runtime.interpreter could be imported")

# Try to find model file path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(base_dir, 'waste_classifier.tflite')
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = 'waste_classifier.tflite'

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"Model file not found at: {MODEL_PATH}")

# Initialize Interpreter
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

class_labels = {
    0: 'battery', 1: 'biological', 2: 'brown-glass', 3: 'cardboard',
    4: 'clothes', 5: 'green-glass', 6: 'metal', 7: 'paper',
    8: 'plastic', 9: 'shoes', 10: 'trash', 11: 'white-glass'
}

disposal_suggestions = {
    'battery': "Recycle batteries at designated hazardous collection points. Do not place in ordinary household waste bins.",
    'biological': "Compost organic and food waste. Composting helps reduce landfill volume and generates nutritious soil.",
    'brown-glass': "Clean out contents and deposit in brown glass bottle bank containers.",
    'cardboard': "Flatten and place in dry recycling containers. Remove shipping tape or plastic inserts.",
    'clothes': "Donate wearable apparel to charitable initiatives. Recycle damaged textiles at recycling collection points.",
    'green-glass': "Clean out and place in green glass bottle bank containers.",
    'metal': "Recycle aluminum cans and clean metal containers. Place in dry recycling containers.",
    'paper': "Place clean paper and newspapers in dry recycling containers. Shred sensitive files.",
    'plastic': "Clean and rinse plastic bottles and packaging. Check classification codes and recycle accordingly.",
    'shoes': "Donate shoes in good shape to charities. Damaged shoes go to specialized textile centers.",
    'trash': "Dispose of in household waste bins. Focus on reduction, composting, and proper sorting to minimize this container.",
    'white-glass': "Clean out contents and deposit in clear/white glass bottle bank containers."
}

# Environmental impact coefficients (kg CO2 equivalent saved per item recycled)
carbon_coefficients = {
    'battery': 0.12,
    'biological': 0.25,
    'brown-glass': 0.35,
    'cardboard': 0.48,
    'clothes': 0.75,
    'green-glass': 0.35,
    'metal': 1.45,
    'paper': 0.52,
    'plastic': 0.88,
    'shoes': 0.60,
    'trash': 0.00,
    'white-glass': 0.35
}

servo_angles = {
    'battery': 15,
    'biological': 45,
    'brown-glass': 75,
    'cardboard': 105,
    'clothes': 135,
    'green-glass': 165,
    'metal': 195,
    'paper': 225,
    'plastic': 255,
    'shoes': 285,
    'trash': 315,
    'white-glass': 345
}

# Stats persistence path configuration (Vercel-friendly /tmp)
if os.environ.get("VERCEL") or os.environ.get("NOW_REGION"):
    STATS_FILE = '/tmp/scans_history.json'
    TEMPLATE_STATS_FILE = os.path.join(base_dir, 'scans_history.json')
else:
    STATS_FILE = os.path.join(base_dir, 'scans_history.json')
    TEMPLATE_STATS_FILE = STATS_FILE

def load_stats():
    # If /tmp stats file doesn't exist, initialize it from original repository file if available
    if not os.path.exists(STATS_FILE) and STATS_FILE != TEMPLATE_STATS_FILE:
        if os.path.exists(TEMPLATE_STATS_FILE):
            try:
                shutil.copy(TEMPLATE_STATS_FILE, STATS_FILE)
            except Exception as e:
                print(f"Error copying stats template to /tmp: {e}")
                
    if not os.path.exists(STATS_FILE):
        return {
            "scans": [],
            "counts": {label: 0 for label in class_labels.values()},
            "carbon_saved": 0.0
        }
    try:
        with open(STATS_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {
            "scans": [],
            "counts": {label: 0 for label in class_labels.values()},
            "carbon_saved": 0.0
        }

def save_stats(stats):
    try:
        # Create directory if it doesn't exist (e.g. /tmp)
        os.makedirs(os.path.dirname(os.path.abspath(STATS_FILE)), exist_ok=True)
        with open(STATS_FILE, 'w') as f:
            json.dump(stats, f, indent=2)
    except Exception as e:
        print(f"Error saving stats: {e}")

@app.post("/api/classify")
async def classify_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Preprocess for model (224x224)
        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], img_array)
        
        # Run inference
        interpreter.invoke()
        
        # Get prediction
        prediction = interpreter.get_tensor(output_details[0]['index'])
        predicted_class_index = int(np.argmax(prediction[0]))
        predicted_class_label = class_labels[predicted_class_index]
        confidence = float(prediction[0][predicted_class_index])
        
        # Recommendations
        suggestion = disposal_suggestions.get(predicted_class_label, "Dispose of responsibly.")
        angle = servo_angles.get(predicted_class_label, 0)
        carbon_saved = carbon_coefficients.get(predicted_class_label, 0.0)
        
        # Update Stats
        stats = load_stats()
        if predicted_class_label not in stats["counts"]:
            stats["counts"][predicted_class_label] = 0
        stats["counts"][predicted_class_label] += 1
        stats["carbon_saved"] = round(stats["carbon_saved"] + carbon_saved, 2)
        
        # Record this scan
        scan_record = {
            "id": len(stats["scans"]) + 1,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "category": predicted_class_label,
            "confidence": round(confidence, 4),
            "carbon_saved": carbon_saved
        }
        stats["scans"].insert(0, scan_record)
        stats["scans"] = stats["scans"][:100]
        
        save_stats(stats)
        
        return {
            "category": predicted_class_label,
            "confidence": confidence,
            "suggestion": suggestion,
            "servoAngle": angle,
            "carbonSaved": carbon_saved,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_stats():
    return load_stats()

@app.post("/api/clear-stats")
async def clear_stats():
    stats = {
        "scans": [],
        "counts": {label: 0 for label in class_labels.values()},
        "carbon_saved": 0.0
    }
    save_stats(stats)
    return {"message": "Stats reset successfully."}

@app.get("/api/guide")
async def get_guide():
    return {
        "categories": [
            {
                "id": label,
                "name": label.replace("-", " ").capitalize(),
                "suggestion": disposal_suggestions[label],
                "angle": servo_angles[label],
                "carbon": carbon_coefficients[label]
            }
            for label in class_labels.values()
        ]
    }
