import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useComputeWorker — offloads heavy computation to a Web Worker.
 *
 * @param {Function} workerFactory  A function that returns a new Worker instance.
 *   Example: () => new Worker(new URL('../workers/fractal.worker.js', import.meta.url))
 *   The factory pattern lets CRA's webpack bundle the worker file correctly.
 *
 * @returns {{ postMessage, result, error, computing, terminate }}
 *   - postMessage(data, transferables?)  Send work to the worker
 *   - result       Latest result from the worker (null initially)
 *   - error        Latest error from the worker (null if none)
 *   - computing    Boolean, true while waiting for a result
 *   - terminate    Manually kill the worker (auto-called on unmount)
 */
export default function useComputeWorker(workerFactory) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [computing, setComputing] = useState(false);

  const workerRef = useRef(null);
  const taskIdRef = useRef(0);

  // Lazily create the worker on first use, not on mount.
  // This avoids spawning workers for components that render but never compute.
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      if (typeof Worker === 'undefined') {
        // No Web Worker support — caller should fall back to sync
        return null;
      }
      const w = workerFactory();
      w.onmessage = (e) => {
        const { taskId, payload, error: workerError } = e.data;
        // Only accept the latest task (discard stale results)
        if (taskId !== taskIdRef.current) return;

        if (workerError) {
          setError(workerError);
          setResult(null);
        } else {
          setError(null);
          setResult(payload);
        }
        setComputing(false);
      };
      w.onerror = (e) => {
        setError(e.message || 'Worker error');
        setComputing(false);
      };
      workerRef.current = w;
    }
    return workerRef.current;
  }, [workerFactory]);

  // Terminate on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const postMessage = useCallback((data, transferables) => {
    const w = getWorker();
    if (!w) {
      // No worker support — return null so caller can fall back
      return false;
    }
    const taskId = ++taskIdRef.current;
    setComputing(true);
    setError(null);
    w.postMessage({ taskId, payload: data }, transferables || []);
    return true;
  }, [getWorker]);

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setComputing(false);
    }
  }, []);

  return { postMessage, result, error, computing, terminate };
}
