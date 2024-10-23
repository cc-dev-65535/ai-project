from transformers import pipeline


def get_model_response():
    messages = [
        {"role": "user", "content": "Who are you?"},
    ]
    pipe = pipeline("text-generation", model="TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    response = pipe(messages)

    return response
