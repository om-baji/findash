import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthTokenService {
  private readonly secret = process.env.AUTH_SECRET ?? 'dev-token-secret';

  sign(payload: Omit<TokenPayload, 'iat'>): string {
    const fullPayload: TokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    };

    const encodedPayload = this.base64UrlEncode(
      Buffer.from(JSON.stringify(fullPayload), 'utf8'),
    );
    const signature = this.base64UrlEncode(this.signValue(encodedPayload));

    return `${encodedPayload}.${signature}`;
  }

  verify(token: string): TokenPayload {
    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid token');
    }

    const expectedSignature = this.base64UrlEncode(
      this.signValue(encodedPayload),
    );

    const provided = Buffer.from(signature, 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');

    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      throw new UnauthorizedException('Invalid token signature');
    }

    try {
      const decoded = this.base64UrlDecode(encodedPayload).toString('utf8');
      const payload = JSON.parse(decoded) as TokenPayload;

      if (
        typeof payload.sub !== 'number' ||
        typeof payload.tokenVersion !== 'number' ||
        typeof payload.iat !== 'number'
      ) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }
  }

  private signValue(value: string): Buffer {
    return createHmac('sha256', this.secret).update(value).digest();
  }

  private base64UrlEncode(input: Buffer): string {
    return input
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private base64UrlDecode(input: string): Buffer {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);

    return Buffer.from(padded, 'base64');
  }
}
