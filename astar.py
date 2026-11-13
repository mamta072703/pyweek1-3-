
import heapq


def manhattan_distance(current, goal):
    """Calculate Manhattan distance between two cells."""
    return abs(current[0] - goal[0]) + abs(current[1] - goal[1])


def get_neighbors(position, rows, cols, walls):
    """Get valid neighboring cells (up, down, left, right)."""

    row, col = position

    directions = [
        (-1, 0),  # Up
        (1, 0),   # Down
        (0, -1),  # Left
        (0, 1)    # Right
    ]

    neighbors = []

    for dr, dc in directions:
        new_row = row + dr
        new_col = col + dc

        if 0 <= new_row < rows and 0 <= new_col < cols:
            neighbor = (new_row, new_col)

            if neighbor not in walls:
                neighbors.append(neighbor)

    return neighbors


def reconstruct_path(came_from, current):
    """Reconstruct the shortest path from goal to start."""

    path = [current]

    while current in came_from:
        current = came_from[current]
        path.append(current)

    path.reverse()
    return path


def astar_search(rows, cols, start, goal, walls):
    """
    Find the shortest path using A* Search.

    Returns:
        found: Whether a path exists.
        path: Shortest path from start to goal.
        explored: Cells explored by the algorithm.
        cost: Number of moves in the path.
    """

    if not (0 <= start[0] < rows and 0 <= start[1] < cols):
        return {
            "found": False,
            "path": [],
            "explored": [],
            "cost": 0,
            "message": "Invalid start position."
        }

    if not (0 <= goal[0] < rows and 0 <= goal[1] < cols):
        return {
            "found": False,
            "path": [],
            "explored": [],
            "cost": 0,
            "message": "Invalid goal position."
        }

    if start in walls or goal in walls:
        return {
            "found": False,
            "path": [],
            "explored": [],
            "cost": 0,
            "message": "Start or goal cannot be an obstacle."
        }

    if start == goal:
        return {
            "found": True,
            "path": [start],
            "explored": [start],
            "cost": 0,
            "message": "Start and goal are the same cell."
        }

    # Priority queue stores (f_score, counter, position)
    open_list = []
    counter = 0

    heapq.heappush(
        open_list,
        (manhattan_distance(start, goal), counter, start)
    )

    # Store the previous cell for path reconstruction
    came_from = {}

    # Cost from start to each cell
    g_score = {start: 0}

    # Cells already processed
    closed_set = set()

    # Order in which cells are explored
    explored = []

    while open_list:

        # Get the cell with the lowest f_score
        _, _, current = heapq.heappop(open_list)

        if current in closed_set:
            continue

        closed_set.add(current)
        explored.append(current)

        # Check whether the goal is reached
        if current == goal:
            path = reconstruct_path(came_from, current)

            return {
                "found": True,
                "path": path,
                "explored": explored,
                "cost": len(path) - 1,
                "message": "Shortest path found successfully!"
            }

        # Explore neighboring cells
        for neighbor in get_neighbors(current, rows, cols, walls):

            if neighbor in closed_set:
                continue

            tentative_g = g_score[current] + 1

            if tentative_g < g_score.get(neighbor, float("inf")):

                came_from[neighbor] = current
                g_score[neighbor] = tentative_g

                h_score = manhattan_distance(neighbor, goal)
                f_score = tentative_g + h_score

                counter += 1

                heapq.heappush(
                    open_list,
                    (f_score, counter, neighbor)
                )

    # No path found
    return {
        "found": False,
        "path": [],
        "explored": explored,
        "cost": 0,
        "message": "No path exists between the start and goal!"
    }


# Test the algorithm independently
if __name__ == "__main__":

    rows = 10
    cols = 10

    start = (0, 0)
    goal = (9, 9)

    walls = {
        (1, 1), (1, 2), (1, 3),
        (2, 3), (3, 3), (4, 3),
        (5, 3), (6, 3)
    }

    result = astar_search(rows, cols, start, goal, walls)

    print("Path Found:", result["found"])
    print("Message:", result["message"])
    print("Path:", result["path"])
    print("Path Cost:", result["cost"])
    print("Explored Nodes:", len(result["explored"]))
