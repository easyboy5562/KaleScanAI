from flask import Flask, render_template, request
import numpy as np
import cv2
from tensorflow.keras.models import load_model
import base64
import os

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

MODEL_PATH = os.path.join(os.path.dirname(__file__), "keras_model.h5")
model = load_model(MODEL_PATH, compile=False)

class_names = [
    "Downy mildew",
    "insect",
    "Not found",
    "normal",
]


@app.route("/", methods=["GET", "POST"])
def index():
    prediction_text = ""
    image_data = ""

    if request.method == "POST":
        file = request.files.get("file")

        if file and file.filename:
            try:
                raw = file.read()

                # ── encode รูปเพื่อส่งกลับไปแสดงผล ──
                mime = file.mimetype or "image/jpeg"
                image_data = f"data:{mime};base64,{base64.b64encode(raw).decode()}"

                # ── predict ──
                npimg = np.frombuffer(raw, np.uint8)
                img   = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

                if img is None:
                    prediction_text = "❌ ไม่สามารถอ่านไฟล์ภาพได้"
                else:
                    img        = cv2.resize(img, (224, 224))
                    img_array  = np.asarray(img, dtype=np.float32)
                    normalized = (img_array / 127.5) - 1.0
                    data       = np.expand_dims(normalized, axis=0)

                    prediction  = model.predict(data, verbose=0)
                    class_index = int(np.argmax(prediction))
                    confidence  = float(prediction[0][class_index])

                    prediction_text = (
                        f"{class_names[class_index]} ({confidence * 100:.2f}%)"
                        if class_index < len(class_names)
                        else "Unknown"
                    )

            except Exception as e:
                prediction_text = f"❌ เกิดข้อผิดพลาด: {e}"

    return render_template(
        "index.html",
        prediction=prediction_text,
        image_data=image_data,
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=True)