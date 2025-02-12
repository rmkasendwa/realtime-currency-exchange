'use client';
import { useEffect } from 'react';
import { initSocketConnection } from '../lib/SocketAdapter';

export default function Index() {
  useEffect(() => {
    initSocketConnection();
  }, []);
  return 'Hello Realtime Currency Exchange';
}
