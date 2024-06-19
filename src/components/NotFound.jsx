import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container">
      <h2>404 - Página Não Encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      <Link to="/homepage">Voltar para a página inicial</Link>
    </div>
  );
};

export default NotFound;
