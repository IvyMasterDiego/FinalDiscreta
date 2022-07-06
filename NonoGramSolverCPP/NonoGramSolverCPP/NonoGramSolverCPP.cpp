#include <iostream>
#include <sstream>
#include <vector>
#include <string>

using namespace std;

bool equals(vector<int> a, vector<int> b) {
	if (a.size() != b.size()) return false;
	for (int i = 0; i < (int)a.size(); i++) {
		if (a[i] != b[i]) return false;
	}
	return true;
}

struct Game {
	int dimension;
	vector< vector<int> > matrix, lines, columns;

	Game() {}
	Game(int _dimension) {
		this->dimension = _dimension;

		matrix.resize(dimension);
		for (int i = 0; i < dimension; i++) matrix[i].resize(dimension, -1);

		lines.resize(dimension);
		columns.resize(dimension);
	}

	void showMatrix() {
		cout << "Resulting grid is: " << endl;
		for (int i = 0; i < dimension; i++) {
			for (int j = 0; j < dimension; j++) {
				if (j != 0) cout << " ";
				cout << ((matrix[i][j] == 1) ? 'O' : 'X');
			}
			cout << endl;
		}
	}

	bool updateLine(int idx) {
		int newVal, pos;
		bool hasChanged = false, go;

		vector<int> aux;
		vector< vector<int> > auxLines;

		for (int i = 1; i < (1 << dimension); i++) {
			go = true;
			aux.clear();
			for (int j = 0; j < dimension; j++) {
				if ((i & (1 << j)) != 0) newVal = 1;
				else newVal = 0;

				if (matrix[idx][j] != -1 and matrix[idx][j] != newVal) go = false;
				aux.push_back(newVal);
			}
			if (go) auxLines.push_back(aux);
		}

		for (int i = auxLines.size() - 1; i >= 0; i--) {
			aux.clear();
			newVal = pos = 0;
			while (pos < dimension) {
				if (auxLines[i][pos] == 0) {
					if (newVal != 0) aux.push_back(newVal), newVal = 0;
				}
				else newVal++;
				pos++;
			}
			if (newVal != 0) aux.push_back(newVal);
			if (not equals(aux, lines[idx])) auxLines.erase(auxLines.begin() + i);
		}

		if (auxLines.size() > 0) {
			for (int j = 0; j < dimension; j++) {
				if (matrix[idx][j] != -1) continue;
				go = true;
				newVal = auxLines[0][j];
				for (int i = 1; i < (int)auxLines.size(); i++) {
					if (newVal != auxLines[i][j]) go = false;
				}
				if (go) matrix[idx][j] = newVal, hasChanged = true;
			}
		}

		return hasChanged;
	}

	bool updateColumn(int idx) {
		int newVal, pos;
		bool hasChanged = false, go;

		vector<int> aux;
		vector< vector<int> > auxLines;

		for (int i = 1; i < (1 << dimension); i++) {
			go = true;
			aux.clear();
			for (int j = 0; j < dimension; j++) {
				if ((i & (1 << j)) != 0) newVal = 1;
				else newVal = 0;

				if (matrix[j][idx] != -1 and matrix[j][idx] != newVal) go = false;
				aux.push_back(newVal);
			}
			if (go) auxLines.push_back(aux);
		}

		for (int i = auxLines.size() - 1; i >= 0; i--) {
			aux.clear();
			newVal = pos = 0;
			while (pos < dimension) {
				if (auxLines[i][pos] == 0) {
					if (newVal != 0) aux.push_back(newVal), newVal = 0;
				}
				else newVal++;
				pos++;
			}
			if (newVal != 0) aux.push_back(newVal);
			if (not equals(aux, columns[idx])) auxLines.erase(auxLines.begin() + i);
		}

		if (auxLines.size() > 0) {
			for (int j = 0; j < dimension; j++) {
				if (matrix[j][idx] != -1) continue;
				go = true;
				newVal = auxLines[0][j];
				for (int i = 1; i < (int)auxLines.size(); i++) {
					if (newVal != auxLines[i][j]) go = false;
				}
				if (go) matrix[j][idx] = newVal, hasChanged = true;
			}
		}

		return hasChanged;
	}

	void solve() {
		bool finished = false;
		while (not finished) {
			finished = true;
			for (int i = 0; i < dimension; i++) {
				if (updateLine(i)) finished = false;
				if (updateColumn(i)) finished = false;
			}
		}
	}
};

void readInput(Game& game) {
	/**
	* dimension
	* info lines
	* info columns
	* (not mandatory) grid
	**/

	int dimension;

	cin >> dimension;
	getchar();

	game = Game(dimension);

	// reading lines
	for (int i = 0; i < dimension; i++) {
		string line, token;
		getline(cin, line);

		stringstream ss(line);
		while (ss >> token) game.lines[i].push_back(stoi(token));
	}

	// reading columns
	for (int i = 0; i < dimension; i++) {
		string line, token;
		getline(cin, line);

		stringstream ss(line);
		while (ss >> token) game.columns[i].push_back(stoi(token));
	}

	if (not cin.eof()) {
		for (int i = 0; i < dimension; i++) {
			for (int j = 0; j < dimension; j++) cin >> game.matrix[i][j];
		}
	}
}

int main() {
	Game game;
	readInput(game);

	game.solve();
	game.showMatrix();
	return 0;
}