from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model
from flask_cors import CORS
import numpy as np
import io
from PIL import Image
from utils.process_data import REVERSE_MAPPING
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = Flask(__name__, template_folder='templates')
CORS(app)
cnn_model = load_model("./cnn.h5", compile=False)

model_path = 'model'
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

reverse_mapping = REVERSE_MAPPING

class_labels = [
    "Atelectasis", "Brain_Tumor", "Cardiomegaly", "Consolidation", "Edema", "Effusion",
    "Emphysema", "Fibrosis", "Hernia", "Infiltration", "Mass", "No_Brain_Finding",
    "No_Lung_Finding", "Nodule", "Pleural", "Pneumonia", "Pneumothorax", "Tuberculosis"
]

def nlp_predict(
    symptoms,
    model=model,
    tokenizer=tokenizer,
    reverse_mapping=reverse_mapping
):
    # Tokenize the user-provided symptoms
    tokenized_inputs = tokenizer(
        symptoms,
        truncation=True,
        padding=True,
        return_tensors="pt"
    )
    # Make predictions
    with torch.no_grad():
        logits = model(**tokenized_inputs).logits
    # Convert logits to predicted class labels
    predicted_labels = torch.argmax(logits, dim=1).tolist()
    # Get class labels based on predicted indices
    predicted_classes = [reverse_mapping[label] for label in predicted_labels]
    return predicted_classes

@app.route('/')
def index():
    return render_template('doctor/doctor.html')

@app.route("/report-submit", methods=["POST"])
def classify_api():
    if request.method == "POST":
        # Get the report and file data
        report = request.form.get('rep', '')
        image_file = request.files.get("upfile", None)

        # Check if both report and file are provided
        if report and image_file:
            img = Image.open(io.BytesIO(image_file.read())).convert("RGB")
            img = img.resize((150, 150))
            img_array = np.array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = img_array / 255.0

            cnn_predictions = cnn_model.predict(img_array)

            # Get the top prediction
            top_prediction_index = np.argmax(cnn_predictions[0])
            top_prediction = class_labels[top_prediction_index]

            symptoms_list = [report]  # You may need to preprocess the symptoms into a list
            predictions = nlp_predict(symptoms_list)

            return jsonify({
                "nlp_prediction": predictions[0],  # Assuming nlp_predict returns a list with one element
                "top_cnn_prediction": top_prediction
            })
        elif report:
            # Handle the case where only the report is provided
            symptoms_list = [report]
            predictions = nlp_predict(symptoms_list)
            return jsonify({"nlp_prediction": predictions[0]})
        elif image_file:
            # Handle the case where only the file is provided
            img = Image.open(io.BytesIO(image_file.read())).convert("RGB")
            img = img.resize((150, 150))
            img_array = np.array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = img_array / 255.0

            cnn_predictions = cnn_model.predict(img_array)

            # Get the top prediction
            top_prediction_index = np.argmax(cnn_predictions[0])
            top_prediction = class_labels[top_prediction_index]
            return jsonify({"top_cnn_prediction": top_prediction})
        else:
            # Handle the case where neither report nor file is provided
            return jsonify({"error": "Both report and file are missing. Please provide either report or file."})

if __name__ == "__main__":
    app.run(debug=True)
