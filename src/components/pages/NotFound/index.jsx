import React from 'react';
import { Link } from 'react-router-dom';
import './index.scss';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <h1>404</h1>
            <span className="chess-piece">♞</span>
            <div className="chessboard"></div>
            <h2>Échec et mat !</h2> 
            <p>Oups ! Cette page a disparu comme un pion promu en dame. 
               Peut-être a-t-elle été capturée en passant ?</p>
            <Link to="/" className="home-link">
                Retour à la case départ
            </Link>
        </div>
    );
};

export default NotFound;