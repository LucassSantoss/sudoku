import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Homepage = () => {
  const [user, setUser] = useState({ username: '', points: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const email = decodedToken.email;

        try {
          const response = await axios.get(`http://localhost:8000/user-info?email=${email}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="container">
      <h1>Sudoku</h1>
      {user.username && (
        <p>Bem-vindo, {user.username}! Sua pontuação: {user.points}</p>
      )}
      <p>Escolha o nível de dificuldade:</p>
      <div className="difficulty-options">
        <Link to="/game?difficulty=easy">Fácil</Link>
        <Link to="/game?difficulty=medium">Médio</Link>
        <Link to="/game?difficulty=hard">Difícil</Link>
      </div>
    </div>
  );
};

export default Homepage;
