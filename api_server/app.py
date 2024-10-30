from flask import Flask, request
from flask_cors import CORS
import model

app = Flask(__name__)
CORS(app)


@app.route("/api", methods=["POST"])
def get_response():
    response = model.get_model_response(request.json["input"])
    return {"data": response}, 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)
