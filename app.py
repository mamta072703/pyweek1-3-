
from flask import Flask, render_template, request, jsonify
from astar import astar_search

app = Flask(__name__)

MAX_ROWS = 50
MAX_COLS = 50


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/solve", methods=["POST"])
def solve_maze():

    try:
        data = request.get_json()

        if not isinstance(data, dict):
            return jsonify({"error": "Invalid request data."}), 400

        rows = int(data.get("rows", 20))
        cols = int(data.get("cols", 20))

        start = tuple(data["start"])
        goal = tuple(data["goal"])

        if len(start) != 2 or len(goal) != 2:
            return jsonify({"error": "Invalid start or goal position."}), 400

        walls = {
            tuple(cell) for cell in data.get("walls", [])
        }

        # Validate grid dimensions
        if not (1 <= rows <= MAX_ROWS and 1 <= cols <= MAX_COLS):
            return jsonify({
                "error": "Grid dimensions must be between 1 and 50."
            }), 400

        # Validate wall coordinates
        for wall in walls:
            if len(wall) != 2:
                return jsonify({"error": "Invalid wall position."}), 400

            if not (0 <= wall[0] < rows and 0 <= wall[1] < cols):
                return jsonify({"error": "Wall position is outside the grid."}), 400

        result = astar_search(rows, cols, start, goal, walls)

        return jsonify({
            "found": result["found"],
            "path": result["path"],
            "explored": result["explored"],
            "cost": result["cost"],
            "explored_count": len(result["explored"]),
            "message": result["message"]
        })

    except (ValueError, TypeError, KeyError):
        return jsonify({
            "error": "Invalid input. Please check the maze settings."
        }), 400

    except Exception:
        app.logger.exception("Unexpected error while solving maze")
        return jsonify({
            "error": "An unexpected error occurred."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
