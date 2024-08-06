import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.url.startsWith('/webhook')) {
      req.setEncoding('utf8');
      let data = '';
      req.on('data', (chunk: string) => {
        data += chunk;
      });
      req.on('end', () => {
        req['rawBody'] = data;
        next();
      });
    } else {
      next();
    }
  }
}
