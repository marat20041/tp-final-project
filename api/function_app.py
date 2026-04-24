import json

from azure.iot.hub import IoTHubRegistryManager

import azure.functions as func

import mysql.connector

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

DB_CONFIG = {

    "host": "localhost",

    "user": "root",

    "password": "root",

    "database": "serre_iot"

}

IOTHUB_CONNECTION_STRING = "HostName=serre-iot.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=uXj90GY6oAdzObhMOT3ScXd/CzQ7b9KjFAIoTAmplpU="

DEVICE_ID = "serre-pi-1"


def get_db_connection():

    return mysql.connector.connect(**DB_CONFIG)


def send_command_to_device(command: str, value=None):

    registry_manager = IoTHubRegistryManager(IOTHUB_CONNECTION_STRING)

    payload = {

        "command": command,

        "value": value

    }

    registry_manager.send_c2d_message(DEVICE_ID, json.dumps(payload))


def default_state(error_message=None):

    return {

        "temperature": 0,

        "light": 0,

        "distance": 0,

        "realOpening": 0,

        "targetOpening": 0,

        "mode": "Manuelle",

        "motorState": "En arrêt",

        "direction": "Aucune",

        "speed": 0,

        "alert": error_message if error_message else "Aucune donnée"

    }


@app.route(route="state", methods=["GET"])

def get_state(req: func.HttpRequest) -> func.HttpResponse:

    try:

        conn = get_db_connection()

        cursor = conn.cursor(dictionary=True)

        query = """

        SELECT

            temperature_c,

            light_level,

            distance_cm,

            real_opening_pct,

            mode,

            target_opening_pct,

            motor_state,

            motor_direction,

            motor_speed_rpm

        FROM sensor_readings

        ORDER BY id DESC

        LIMIT 1

        """

        cursor.execute(query)

        row = cursor.fetchone()

        alert_query = """

        SELECT message

        FROM alerts

        WHERE is_active = TRUE

        ORDER BY id DESC

        LIMIT 1

        """

        cursor.execute(alert_query)

        alert_row = cursor.fetchone()

        cursor.close()

        conn.close()

        if not row:

            state = default_state()

        else:

            state = {

                "temperature": float(row["temperature_c"]),

                "light": int(row["light_level"]),

                "distance": float(row["distance_cm"]),

                "realOpening": int(row["real_opening_pct"]),

                "targetOpening": int(row["target_opening_pct"]),

                "mode": row["mode"],

                "motorState": row["motor_state"],

                "direction": row["motor_direction"],

                "speed": int(row["motor_speed_rpm"]),

                "alert": alert_row["message"] if alert_row else "Aucune"

            }

        return func.HttpResponse(

            json.dumps(state),

            mimetype="application/json",

            status_code=200

        )

    except Exception as e:

        state = default_state("État indisponible (DB cloud)")

        return func.HttpResponse(

            json.dumps(state),

            mimetype="application/json",

            status_code=200

        )


@app.route(route="command", methods=["POST"])

def post_command(req: func.HttpRequest) -> func.HttpResponse:

    try:

        data = req.get_json()

        command = data.get("command")

        value = data.get("value")

        command_type = None

        command_value = None

        iot_command = None

        iot_value = value

        if command == "open":

            command_type = "set_target"

            command_value = "100"

            iot_command = "set_target"

            iot_value = 100

        elif command == "close":

            command_type = "set_target"

            command_value = "0"

            iot_command = "set_target"

            iot_value = 0

        elif command == "set_mode":

            command_type = "set_mode"

            command_value = str(value)

            iot_command = "mode"

            iot_value = str(value)

        elif command == "set_target":

            command_type = "set_target"

            command_value = str(value)

            iot_command = "set_target"

            iot_value = int(value)

        else:

            return func.HttpResponse(

                json.dumps({"error": "Commande invalide"}),

                mimetype="application/json",

                status_code=400

            )

        # 1) Always send to IoT Hub first

        send_command_to_device(iot_command, iot_value)

        # 2) Try to log to DB, but do not fail the command if DB is unavailable

        db_logged = False

        db_error = None

        try:

            conn = get_db_connection()

            cursor = conn.cursor()

            insert_query = """

            INSERT INTO commands

            (command_type, command_value, command_source, execution_status, sync_status)

            VALUES (%s, %s, %s, %s, %s)

            """

            cursor.execute(

                insert_query,

                (command_type, command_value, "web_app", "pending", "pending")

            )

            conn.commit()

            cursor.close()

            conn.close()

            db_logged = True

        except Exception as db_ex:

            db_error = str(db_ex)

        return func.HttpResponse(

            json.dumps({

                "success": True,

                "saved_command": {

                    "command_type": command_type,

                    "command_value": command_value

                },

                "iot_message_sent": {

                    "command": iot_command,

                    "value": iot_value,

                    "device_id": DEVICE_ID

                },

                "db_logged": db_logged,

                "db_error": db_error

            }),

            mimetype="application/json",

            status_code=200

        )

    except Exception as e:

        return func.HttpResponse(

            json.dumps({"error": str(e)}),

            mimetype="application/json",

            status_code=500

        )
 