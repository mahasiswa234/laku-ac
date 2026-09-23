import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_here';

export interface AuthUser {
  userId: number;
  email: string;
  role: 'admin' | 'technician' | 'customer' | string;
  iat?: number;
  exp?: number;
}

// Extensi tipe Request Express untuk menyisipkan data user
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          valid: false,
          message: 'Token tidak valid atau kedaluwarsa. Silakan login kembali.' 
        });
      }
      req.user = decoded as AuthUser;
      next();
    });
  } else {
    res.status(401).json({ 
      valid: false,
      message: 'Akses ditolak: token otentikasi tidak ditemukan dalam header permintaan.' 
    });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Pengguna belum terautentikasi' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Akses ditolak: peran '${req.user.role}' tidak memiliki izin untuk rute ini.` 
      });
    }

    next();
  };
};
