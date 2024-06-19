import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setMessage('Enviando email de boas-vindas!');
      const data = await register(nome, email, senha);
      setTimeout(() => {
        setMessage('');
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.mensagem);
    }
  };

  return (
    <div className="container">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Senha:</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Registrar</button>
      </form>
      <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
      <p id='msg'>{message}</p>
    </div>
  );
};

export default Register;
