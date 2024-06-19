import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { easySudoku, mediumSudoku, hardSudoku } from '../data/sudokuBoards';

const Game = () => {
  const [sudoku, setSudoku] = useState([]);
  const [initialSudoku, setInitialSudoku] = useState([]);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const difficulty = query.get('difficulty');
  const navigate = useNavigate();

  useEffect(() => {
    let board;
    let time;
    switch (difficulty) {
      case 'easy':
        board = easySudoku;
        time = 30;
        break;
      case 'medium':
        board = mediumSudoku;
        time = 120;
        break;
      case 'hard':
        board = hardSudoku;
        time = 300;
        break;
      default:
        board = easySudoku;
        time = 30;
    }
    setSudoku(board.map(row => row.slice()));
    setInitialSudoku(board);
    setTimeLeft(time);

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setMessage("Tempo esgotado! Você perdeu.");
          setTimeout(() => navigate('/homepage'), 2000);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [difficulty, navigate]);

  const handleChange = (value, rowIndex, colIndex) => {
    const newSudoku = sudoku.map(row => row.slice());
    newSudoku[rowIndex][colIndex] = value ? parseInt(value) : null;
    setSudoku(newSudoku);
  };

  const isNumberRepeated = (array) => {
    let counts = {};
    for (let i = 0; i < array.length; i++) {
      if (counts[array[i]]) {
        return true;
      }
      counts[array[i]] = 1;
    }
    return false;
  };

  const verifyLine = (matrix, indexOfLine) => {
    let line = matrix[indexOfLine];
    for (let i = 1; i <= 9; i++) {
      if (line.indexOf(i) === -1) {
        return false;
      }
    }
    return !isNumberRepeated(line);
  };

  const verifyColumn = (matrix, indexOfColumn) => {
    let column = [];
    for (let i = 0; i < matrix.length; i++) {
      column.push(matrix[i][indexOfColumn]);
    }
    for (let i = 1; i <= 9; i++) {
      if (column.indexOf(i) === -1) {
        return false;
      }
    }
    return !isNumberRepeated(column);
  };

  const verifyQuadrant = (matrix, quadrantRow, quadrantCol) => {
    let quadrant = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        quadrant.push(matrix[quadrantRow * 3 + i][quadrantCol * 3 + j]);
      }
    }
    for (let i = 1; i <= 9; i++) {
      if (quadrant.indexOf(i) === -1) {
        return false;
      }
    }
    return !isNumberRepeated(quadrant);
  };

  const verifyAllSudoku = (matrix) => {
    for (let i = 0; i < 9; i++) {
      if (!verifyLine(matrix, i) || !verifyColumn(matrix, i)) {
        return false;
      }
    }
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (!verifyQuadrant(matrix, row, col)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (verifyAllSudoku(sudoku)) {
      setMessage("Você ganhou!!!");

      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const email = decodedToken.email;
        await axios.post('http://localhost:8000/update-points', { email, difficulty }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setTimeout(() => {
          navigate('/homepage');
        }, 2000);
      } catch (error) {
        console.error('Erro ao atualizar a pontuação:', error);
      }
    } else {
      setMessage("Tabuleiro incorreto :(");
    }
  };

  return (
    <div className="container">
      <h2>Sudoku - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
      <p className="timer">Tempo restante: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
      <div className="sudoku-board">
        {sudoku.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((num, colIndex) => (
              <div key={colIndex} className="sudoku-cell">
                <input
                  type="number"
                  value={num !== null ? num : ''}
                  min="1"
                  max="9"
                  onChange={(e) => handleChange(e.target.value, rowIndex, colIndex)}
                  readOnly={initialSudoku[rowIndex][colIndex] !== null}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleSubmit}>Verificar</button>
      <br />
      <Link to="/homepage">Voltar ao menu principal</Link>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Game;
