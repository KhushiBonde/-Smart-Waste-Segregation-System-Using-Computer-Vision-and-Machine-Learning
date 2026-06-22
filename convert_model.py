import tensorflow as tf
import os

def convert():
    model_path = 'waste_classifier.keras'
    tflite_path = 'waste_classifier.tflite'
    
    if not os.path.exists(model_path):
        print(f"Error: {model_path} not found.")
        return

    print("Loading Keras model...")
    model = tf.keras.models.load_model(model_path)
    
    print("Converting to TensorFlow Lite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    
    print(f"Saving TFLite model to {tflite_path}...")
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    
    print("Conversion complete!")

if __name__ == '__main__':
    convert()
