import { renderHook, act } from '@testing-library/react';
import useComputeWorker from './useComputeWorker';

// Mock Worker class
class MockWorker {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
    this.terminated = false;
    this.lastMessage = null;
    // Store instance for test assertions
    MockWorker.lastInstance = this;
  }
  postMessage(data) {
    this.lastMessage = data;
  }
  terminate() {
    this.terminated = true;
  }
}

describe('useComputeWorker', () => {
  let originalWorker;

  beforeEach(() => {
    originalWorker = global.Worker;
    global.Worker = MockWorker;
    MockWorker.lastInstance = null;
  });

  afterEach(() => {
    global.Worker = originalWorker;
  });

  test('returns expected API shape', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    expect(result.current).toHaveProperty('postMessage');
    expect(result.current).toHaveProperty('result');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('computing');
    expect(result.current).toHaveProperty('terminate');
    expect(typeof result.current.postMessage).toBe('function');
    expect(typeof result.current.terminate).toBe('function');
  });

  test('starts with idle state', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.computing).toBe(false);
  });

  test('does not create worker until postMessage is called', () => {
    const factory = jest.fn(() => new MockWorker());
    renderHook(() => useComputeWorker(factory));

    expect(factory).not.toHaveBeenCalled();
  });

  test('creates worker on first postMessage', () => {
    const factory = jest.fn(() => new MockWorker());
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ test: true });
    });

    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current.computing).toBe(true);
  });

  test('reuses same worker for subsequent calls', () => {
    const factory = jest.fn(() => new MockWorker());
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ call: 1 });
    });
    act(() => {
      result.current.postMessage({ call: 2 });
    });

    expect(factory).toHaveBeenCalledTimes(1);
  });

  test('sends taskId and payload to worker', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ value: 42 });
    });

    const worker = MockWorker.lastInstance;
    expect(worker.lastMessage).toEqual({ taskId: 1, payload: { value: 42 } });
  });

  test('receives result from worker', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ value: 1 });
    });

    const worker = MockWorker.lastInstance;

    act(() => {
      worker.onmessage({ data: { taskId: 1, payload: { answer: 42 } } });
    });

    expect(result.current.result).toEqual({ answer: 42 });
    expect(result.current.computing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('discards stale results from previous tasks', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ call: 1 }); // taskId 1
    });
    act(() => {
      result.current.postMessage({ call: 2 }); // taskId 2
    });

    const worker = MockWorker.lastInstance;

    // Stale result for task 1 arrives
    act(() => {
      worker.onmessage({ data: { taskId: 1, payload: { stale: true } } });
    });

    // Should still be computing (waiting for task 2)
    expect(result.current.computing).toBe(true);
    expect(result.current.result).toBeNull();

    // Task 2 arrives
    act(() => {
      worker.onmessage({ data: { taskId: 2, payload: { fresh: true } } });
    });

    expect(result.current.result).toEqual({ fresh: true });
    expect(result.current.computing).toBe(false);
  });

  test('handles worker errors via onmessage error field', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ test: 1 });
    });

    const worker = MockWorker.lastInstance;

    act(() => {
      worker.onmessage({ data: { taskId: 1, error: 'Something broke' } });
    });

    expect(result.current.error).toBe('Something broke');
    expect(result.current.result).toBeNull();
    expect(result.current.computing).toBe(false);
  });

  test('handles worker onerror', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ test: 1 });
    });

    const worker = MockWorker.lastInstance;

    act(() => {
      worker.onerror({ message: 'Fatal worker error' });
    });

    expect(result.current.error).toBe('Fatal worker error');
    expect(result.current.computing).toBe(false);
  });

  test('terminate kills the worker', () => {
    const factory = () => new MockWorker();
    const { result } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ test: 1 });
    });

    const worker = MockWorker.lastInstance;

    act(() => {
      result.current.terminate();
    });

    expect(worker.terminated).toBe(true);
    expect(result.current.computing).toBe(false);
  });

  test('terminates worker on unmount', () => {
    const factory = () => new MockWorker();
    const { result, unmount } = renderHook(() => useComputeWorker(factory));

    act(() => {
      result.current.postMessage({ test: 1 });
    });

    const worker = MockWorker.lastInstance;
    unmount();

    expect(worker.terminated).toBe(true);
  });

  test('returns false from postMessage when Worker is unavailable', () => {
    delete global.Worker;
    const factory = () => { throw new Error('should not be called'); };
    const { result } = renderHook(() => useComputeWorker(factory));

    let sent;
    act(() => {
      sent = result.current.postMessage({ test: 1 });
    });

    expect(sent).toBe(false);
    expect(result.current.computing).toBe(false);
  });
});
