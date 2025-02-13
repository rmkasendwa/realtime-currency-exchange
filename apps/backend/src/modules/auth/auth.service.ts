import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private generateAccessToken(id: string, email: string): string {
    const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
    const accessToken = this.jwtService.sign(
      { id, email },
      { secret: JWT_ACCESS_TOKEN_SECRET, expiresIn: '15m' }
    );
    return accessToken;
  }

  private generateRefreshToken(id: string, email: string): string {
    const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
    const refreshToken = this.jwtService.sign(
      { id, email },
      { secret: JWT_REFRESH_TOKEN_SECRET, expiresIn: '1d' }
    );
    return refreshToken;
  }
}
