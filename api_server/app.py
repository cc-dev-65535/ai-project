from flask import Flask
from flask_cors import CORS
import model

app = Flask(__name__)
CORS(app)


@app.route("/")
def get_response():
    return f"<p>{model.get_model_response()[0]["generated_text"][1]["content"]}</p>"


if __name__ == "__main__":
    app.run(debug=True)
