import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  // intercept fetch to /answer to store evaluation when done
  const origFetch = global.fetch;
  if (typeof window !== 'undefined' && !(window as any).__patched) {
    (window as any).__patched = true;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const resp = await origFetch(input, init);
      try {
        const url = typeof input === 'string' ? input : (input as URL).toString();
        if (url.endsWith('/api/interview/answer')) {
          const clone = resp.clone();
          const data = await clone.json();
          if (data?.done && data?.evaluation) {
            window.localStorage.setItem('lastEvaluation', data.evaluation);
          }
        }
      } catch {}
      return resp;
    };
  }
  return <Component {...pageProps} />;
}
