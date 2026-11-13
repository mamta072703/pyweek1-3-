
# Maze Solver Using A* Search

An interactive maze-solving application built using Python, Flask, HTML, CSS and JavaScript. It uses the A* Search Algorithm to find the optimal shortest path between a starting point and a goal.

## Features

- Interactive 2D maze grid.
- Customizable rows and columns.
- Set starting and goal positions.
- Draw and remove obstacle walls.
- A* Search Algorithm implementation.
- Manhattan Distance heuristic.
- Animated exploration of cells.
- Shortest path visualization.
- Path length and explored-node statistics.
- Execution time measurement.
- Handles unreachable destinations.
- Reset and clear maze options.

## Technologies Used

- Python
- Flask
- HTML5
- CSS3
- JavaScript
- Heapq (Priority Queue)

## Algorithm

The project implements A* Search using:

f(n) = g(n) + h(n)

Where:

- g(n) represents the actual cost from the start.
- h(n) represents the estimated distance to the goal.
- f(n) represents the estimated total path cost.

Manhattan Distance is used as the heuristic:

h(n) = |x1 - x2| + |y1 - y2|

The algorithm supports four-directional movement.

## Project Structure

pweek3/
- app.py
- astar.py
- requirements.txt
- README.md
- templates/index.html
- static/style.css
- static/script.js

## Installation

1. Clone the repository:

   git clone YOUR_GITHUB_REPOSITORY_URL

2. Open the project folder:

   cd pweek3

3. Create a virtual environment:

   python3 -m venv venv

4. Activate the virtual environment:

   source venv/bin/activate

5. Install dependencies:

   pip install -r requirements.txt

6. Run the application:

   python app.py

7. Open the application in your browser:

   http://127.0.0.1:5000

## How to Use

1. Select Draw Walls to add obstacles.
2. Select Set Start to change the starting cell.
3. Select Set Goal to change the destination.
4. Click Find Shortest Path.
5. Watch the explored cells and shortest path animation.
6. Use Clear Walls or Reset Maze to start again.

## Algorithm Complexity

For a grid with V cells and E neighboring connections, A* uses a priority queue.

Typical time complexity: O((V + E) log V)

Space complexity: O(V)

## Author

Developed as a Maze Solver Using A* Search challenge project.

