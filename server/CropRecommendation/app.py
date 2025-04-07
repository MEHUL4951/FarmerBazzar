from flask import Flask, request, jsonify
import pickle
import io
import numpy as np
import json
from PIL import Image
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
from flask_cors import CORS




app = Flask(__name__)
CORS(app)

class_indices = json.load(open('class_indices.json'))
crop_disease_model = load_model('plant_disease_model.h5')
# Load Model & Label Encoders
with open("fertilizer_recommendation.pkl", "rb") as model_file:
    fertilizer_model = pickle.load(model_file)

# with open("label_encoders.pkl", "rb") as enc_file:
#     label_encoders = pickle.load(enc_file)




# Load the trained Random Forest model
# with open('crop_recommendation_rf.pkl', 'rb') as file:
#     model = pickle.load(file)






# Load Label Encoder (if needed)

# le = LabelEncoder()
# le.classes_ = np.load('label_classes.npy', allow_pickle=True)  # Assuming you saved classes

# Endpoint to make predictions
# @app.route('/predict', methods=['POST'])
# def predict_crop():
#     try:
#         data = request.json
#         temperature = data.get('temperature')
#         humidity = data.get('humidity')
#         ph = data.get('ph')
#         rainfall = data.get('rainfall')

#         # Check if all parameters are present
#         if None in [temperature, humidity, ph, rainfall]:
#             return jsonify({'error': 'Missing required parameters'}), 400

#         input_data = np.array([[temperature, humidity, ph, rainfall]])
        
#         # Make prediction
#         prediction = model.predict(input_data)
#         recommended_crop = le.inverse_transform(prediction)

#         return jsonify({'crop': recommended_crop[0]})
    
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
    

# # Predict Fertilizeer
@app.route('/predict-fertilizer', methods=['POST'])
def predict():
    try:
        data = request.json
        # Encode input values
        encoded_input = [
            label_encoders["Crop Name"].transform([data["crop_name"]])[0],
            label_encoders["Soil Type"].transform([data["soil_type"]])[0],
            data["pH_level"],  # pH is numerical, no encoding needed
            label_encoders["Climate Condition"].transform([data["climate_condition"]])[0]
        ]

        # Predict fertilizer
        prediction = fertilizer_model.predict([encoded_input])
        recommended_fertilizer = label_encoders["Recommended Fertilizer"].inverse_transform(prediction)[0]

        return jsonify({"recommended_fertilizer": recommended_fertilizer})

    except KeyError:
        return jsonify({"error": "Invalid input values!"}), 400








# crop disease prediction

def load_and_preprocess_image(image_path, target_size=(224, 224)):
    img = Image.open(io.BytesIO(image_path))
    img = img.resize(target_size)
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array.astype('float32') / 255.0
    return img_array

def predict_image_class(model, image_path, class_indices):

    preprocessed_img = load_and_preprocess_image(image_path)
    predictions = model.predict(preprocessed_img)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    confidence = float(np.max(predictions))
    confidence = round(confidence * 100, 2)  # Convert to percentage
    predicted_class_name = class_indices[str(predicted_class_index)]
    return predicted_class_name, confidence

@app.route('/predict-crop-disease', methods=['POST'])
def predict_crop_disease():
    try:
        # Check if an image file is in the request
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image = request.files["image"]

        # Check if the file has a valid name
        if image.filename == "":
            return jsonify({"error": "No selected file"}), 400

        # Read image into memory (for processing)
        image_data = image.read()

        # Call your prediction function (pass image data instead of file path)
        predicted_class, confidence = predict_image_class(crop_disease_model, image_data, class_indices)

        return jsonify({'predicted_class': predicted_class, 'confidence': confidence}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)