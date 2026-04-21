import azure.functions as func
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

serre_state = {
    "temperature": 28.5,
    "light": 72,
    "distance": 15.4,
    "realOpening": 40,
    "targetOpening": 50,
    "mode": "Automatique",
    "motorState": "En marche",
    "direction": "Ouverture",
    "speed": 20,
    "alert": "Aucune"
}

@app.route(route="state", methods=["GET"])
def get_state(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(serre_state),
        mimetype="application/json",
        status_code=200
    )

@app.route(route="command", methods=["POST"])
def post_command(req: func.HttpRequest) -> func.HttpResponse:
    global serre_state

    try:
        data = req.get_json()
    except ValueError:
        return func.HttpResponse("JSON invalide", status_code=400)

    command = data.get("command")
    value = data.get("value")

    if command == "open":
        serre_state["targetOpening"] = 100
        serre_state["mode"] = "Manuelle"
    elif command == "close":
        serre_state["targetOpening"] = 0
        serre_state["mode"] = "Manuelle"
    elif command == "set_mode":
        serre_state["mode"] = value
    elif command == "set_target":
        serre_state["targetOpening"] = int(value)
        serre_state["mode"] = "Manuelle"

    return func.HttpResponse(
        json.dumps({"success": True, "state": serre_state}),
        mimetype="application/json",
        status_code=200
    )