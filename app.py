
# app.py

import streamlit as st
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import os

# Set page title and favicon
st.set_page_config(
    page_title="Waste Classification System",
    page_icon=":recycle:",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Custom CSS for a more professional look
st.markdown("""
<style>
.main-header {
    font-size: 3em; /* Larger font size for the main title */
    color: #008080; /* Teal color */
    text-align: center;
    margin-bottom: 30px;
    text-shadow: 2px 2px 5px rgba(0,0,0,0.2);
}
.subheader {
    font-size: 1.5em;
    color: #2F4F4F; /* Dark Slate Gray */
    text-align: center;
    margin-bottom: 20px;
}
.prediction-box {
    background-color: #e6f7ff; /* Light blue background */
    border-left: 5px solid #008CBA; /* Blue border */
    padding: 15px;
    margin-top: 20px;
    border-radius: 8px;
}
.disposal-box {
    background-color: #f0fff0; /* Light green background */
    border-left: 5px solid #28a745; /* Green border */
    padding: 15px;
    margin-top: 15px;
    border-radius: 8px;
}
.stButton>button {
    background-color: #4CAF50; /* Green */
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 12px;
    border: none;
}
</style>
""", unsafe_allow_html=True)

# Load the trained model
@st.cache_resource
def load_my_model():
    model_path = 'waste_classifier.keras'
    if not os.path.exists(model_path):
        st.error(f"Model file not found at: {model_path}")
        st.stop()
    return tf.keras.models.load_model(model_path)

model = load_my_model()

# Define class names (must match the training data)
class_labels = {
    0: 'battery', 1: 'biological', 2: 'brown-glass', 3: 'cardboard',
    4: 'clothes', 5: 'green-glass', 6: 'metal', 7: 'paper',
    8: 'plastic', 9: 'shoes', 10: 'trash', 11: 'white-glass'
}

# Waste disposal suggestions for each category
disposal_suggestions = {
    'battery': "Recycle batteries at designated collection points. Do not dispose of in regular trash as they contain hazardous materials.",
    'biological': "Compost organic waste. If composting is not an option, dispose of in general waste.",
    'brown-glass': "Rinse and recycle in brown glass recycling bins. Remove lids and labels if possible.",
    'cardboard': "Flatten cardboard boxes and recycle them and ensure they are clean and dry.",
    'clothes': "Donate usable clothes to charities. Recycle old or damaged textiles at specific textile recycling centers.",
    'green-glass': "Rinse and recycle in green glass recycling bins. Remove lids and labels if possible.",
    'metal': "Recycle metal items at local recycling facilities. Separate different types of metal if required.",
    'paper': "Recycle clean and dry paper products. Shred sensitive documents before recycling.",
    'plastic': "Rinse plastic containers and recycle according to local guidelines (check recycling codes).",
    'shoes': "Donate wearable shoes. For unwearable shoes, check with local recycling centers for textile recycling options.",
    'trash': "Dispose of in general waste. Try to reduce general waste by recycling and composting as much as possible.",
    'white-glass': "Rinse and recycle in clear/white glass recycling bins. Remove lids and labels if possible."
}

# Main application layout
st.markdown("<h1 class='main-header'>♻️ Waste Classification System</h1>", unsafe_allow_html=True)
st.markdown("<p class='subheader'>Identify waste types and get proper disposal recommendations.</p>", unsafe_allow_html=True)

st.sidebar.title("About This App")
st.sidebar.info(
    "This application uses a Convolutional Neural Network (CNN) model "
    "trained on a dataset of 12 waste categories to classify uploaded images. "
    "It provides a predicted waste category along with a confidence score and disposal suggestions."
)
st.sidebar.header("Model Details")
st.sidebar.markdown(
    "- **Model Architecture:** MobileNetV2 (Transfer Learning)"
    "- **Training Data:** 12 waste categories (battery, biological, brown-glass, cardboard, clothes, green-glass, metal, paper, plastic, shoes, trash, white-glass)"
    "- **Validation Accuracy:** ~91%"
    "- **Input Image Size:** 224x224 pixels"
)


st.subheader("Upload Your Waste Image")
uploaded_file = st.file_uploader("", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display the uploaded image
    col1, col2 = st.columns([1, 2])
    with col1:
        st.write("### Uploaded Image")
        img = Image.open(uploaded_file)
        st.image(img, use_column_width=True)

    with col2:
        st.write("### Classification Result")
        st.write("Classifying...")

        # Preprocess the image
        img = img.resize((224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        img_array = img_array / 255.0  # Normalize pixel values

        # Make prediction
        prediction = model.predict(img_array, verbose=0)
        predicted_class_index = np.argmax(prediction)
        predicted_class_label = class_labels[predicted_class_index]
        confidence = np.max(prediction)

        st.markdown(f"<div class='prediction-box'>", unsafe_allow_html=True)
        st.markdown(f"Predicted class: <span style='font-size:1.2em; font-weight:bold; color:#008CBA;'>{predicted_class_label.upper()}</span>", unsafe_allow_html=True)
        st.markdown(f"Confidence: <span style='font-size:1.1em; font-weight:bold; color:#008CBA;'>{confidence:.2%}</span>", unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

        # Show disposal suggestion
        if predicted_class_label in disposal_suggestions:
            st.markdown(f"<div class='disposal-box'>", unsafe_allow_html=True)
            st.markdown(f"### Disposal Suggestion for {predicted_class_label.capitalize()}:")
            st.write(disposal_suggestions[predicted_class_label])
            st.markdown("</div>", unsafe_allow_html=True)
        else:
            st.warning("Disposal suggestion not available for this category.")

st.markdown("""
---
<p style='text-align: center; color: gray;'>
    Built with ❤️ and Streamlit for Educational Purposes
</p>
""", unsafe_allow_html=True)
