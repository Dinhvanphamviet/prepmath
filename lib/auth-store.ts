import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const REFRESH_TOKEN_TTL_SECONDS = 15 * 60;

export async function createRefreshToken(userId: string) {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

    await query(
        `INSERT INTO refresh_tokens (token, user_id, expires_at)
     VALUES ($1, $2, $3)`,
        [token, userId, expiresAt.toISOString()]
    );

    return token;
}

export async function verifyRefreshToken(token: string) {
    const result = await query(
        `SELECT * FROM refresh_tokens 
     WHERE token = $1 
       AND revoked = FALSE 
       AND expires_at > NOW()`,
        [token]
    );

    return result.rows[0]; 
}

export async function revokeRefreshToken(token: string) {
    await query(
        `UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1`,
        [token]
    );
}

export async function revokeAllUserRefreshTokens(userId: string) {
    await query(
        `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`,
        [userId]
    );
}
