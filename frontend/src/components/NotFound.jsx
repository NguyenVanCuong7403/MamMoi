import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/NotFound.css';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="error-code">
                    <span className="four">4</span>
                    <span className="zero">
                        <div className="plant-icon">🌱</div>
                    </span>
                    <span className="four">4</span>
                </div>

                <h1 className="error-title">Trang không tồn tại</h1>
                <p className="error-description">
                    Oops! Có vẻ như bạn đã đi lạc vào một khu vườn không tồn tại.
                    Hãy quay lại trang chủ để tiếp tục khám phá.
                </p>

                <div className="action-buttons">
                    <button
                        className="btn-home"
                        onClick={() => navigate('/')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Về trang chủ
                    </button>

                    <button
                        className="btn-back"
                        onClick={() => navigate(-1)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Quay lại
                    </button>
                </div>

                <div className="decorative-plants">
                    <span className="plant plant-1">🌿</span>
                    <span className="plant plant-2">🍃</span>
                    <span className="plant plant-3">🌾</span>
                    <span className="plant plant-4">🌻</span>
                    <span className="plant plant-5">🌺</span>
                </div>
            </div>
        </div>
    );
}
