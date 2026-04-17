import { Query, getQueryMethods } from '../../../src/decorators/query.decorator';
import { QueryMethodMetadata } from '../../../src/types';

describe('Query Decorator', () => {
  describe('Custom()', () => {
    it('should register a custom method with basic options', () => {
      class TestController {
        @Query({
          method: 'get',
          endpoint: '/test',
        })
        public testMethod() {
          return 'test';
        }
      }

      const customMethods = getQueryMethods(new TestController());
      expect(customMethods.size).toBe(1);
      expect(customMethods.has('testMethod')).toBe(true);

      const metadata = customMethods.get('testMethod');
      expect(metadata?.methodName).toBe('testMethod');
      expect(metadata?.method).toBe('get');
      expect(metadata?.endpoint).toBe('/test');
      expect(metadata?.parameters).toEqual([]);
    });

    it('should register a custom method with parameters', () => {
      class TestController {
        @Query({
          method: 'get',
          endpoint: '/users/active',
          parameters: [
            { name: 'status', type: 'string' as any, required: true },
            { name: 'limit', type: 'number' as any, required: false, defaultValue: 100 },
          ],
        })
        public getActiveUsers() {
          return [];
        }
      }

      const customMethods = getQueryMethods(new TestController());
      const metadata = customMethods.get('getActiveUsers');

      expect(metadata?.parameters).toHaveLength(2);
      expect(metadata?.parameters[0]).toEqual({
        name: 'status',
        type: 'string',
        required: true,
      });
      expect(metadata?.parameters[1]).toEqual({
        name: 'limit',
        type: 'number',
        required: false,
        defaultValue: 100,
      });
    });

    it('should support different HTTP methods', () => {
      class TestController {
        @Query({ method: 'get', endpoint: '/get-endpoint' })
        public getMethod() {}

        @Query({ method: 'post', endpoint: '/post-endpoint' })
        public postMethod() {}

        @Query({ method: 'put', endpoint: '/put-endpoint' })
        public putMethod() {}

        @Query({ method: 'delete', endpoint: '/delete-endpoint' })
        public deleteMethod() {}
      }

      const customMethods = getQueryMethods(new TestController());
      expect(customMethods.size).toBe(4);

      expect(customMethods.get('getMethod')?.method).toBe('get');
      expect(customMethods.get('postMethod')?.method).toBe('post');
      expect(customMethods.get('putMethod')?.method).toBe('put');
      expect(customMethods.get('deleteMethod')?.method).toBe('delete');
    });

    it('should register multiple custom methods on the same controller', () => {
      class TestController {
        @Query({ method: 'get', endpoint: '/first' })
        public firstMethod() {}

        @Query({ method: 'get', endpoint: '/second' })
        public secondMethod() {}

        @Query({ method: 'post', endpoint: '/third' })
        public thirdMethod() {}
      }

      const customMethods = getQueryMethods(new TestController());
      expect(customMethods.size).toBe(3);
      expect(customMethods.has('firstMethod')).toBe(true);
      expect(customMethods.has('secondMethod')).toBe(true);
      expect(customMethods.has('thirdMethod')).toBe(true);
    });

    it('should preserve the original method functionality', () => {
      class TestController {
        @Query({ method: 'get', endpoint: '/test' })
        public testMethod(value: string) {
          return `result: ${value}`;
        }
      }

      const controller = new TestController();
      expect(controller.testMethod('hello')).toBe('result: hello');
    });
  });

  describe('getQueryMethods()', () => {
    it('should return empty map for controller without custom methods', () => {
      class EmptyController {}

      const customMethods = getQueryMethods(new EmptyController());
      expect(customMethods.size).toBe(0);
    });

    it('should work with controller instance', () => {
      class TestController {
        @Query({ method: 'get', endpoint: '/test' })
        public testMethod() {}
      }

      const instance = new TestController();
      const customMethods = getQueryMethods(instance);
      expect(customMethods.size).toBe(1);
    });

    it('should work with controller class (via __queryMethods)', () => {
      class TestController {
        @Query({ method: 'get', endpoint: '/test' })
        public testMethod() {}
      }

      // When passing the class directly, we need to access __queryMethods
      const customMethods = (TestController as any).__queryMethods || new Map();
      expect(customMethods.size).toBe(1);
    });

    it('should return correct metadata structure', () => {
      class TestController {
        @Query({
          method: 'post',
          endpoint: '/create',
          parameters: [{ name: 'data', type: 'string' as any, required: true }],
        })
        public createItem() {}
      }

      const customMethods = getQueryMethods(new TestController());
      const metadata: QueryMethodMetadata | undefined = customMethods.get('createItem');

      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('methodName');
      expect(metadata).toHaveProperty('method');
      expect(metadata).toHaveProperty('endpoint');
      expect(metadata).toHaveProperty('parameters');
    });
  });

  describe('Inheritance', () => {
    it('should not share custom methods between unrelated controllers', () => {
      class ControllerA {
        @Query({ method: 'get', endpoint: '/a' })
        public methodA() {}
      }

      class ControllerB {
        @Query({ method: 'get', endpoint: '/b' })
        public methodB() {}
      }

      const methodsA = getQueryMethods(new ControllerA());
      const methodsB = getQueryMethods(new ControllerB());

      expect(methodsA.size).toBe(1);
      expect(methodsB.size).toBe(1);
      expect(methodsA.has('methodA')).toBe(true);
      expect(methodsA.has('methodB')).toBe(false);
      expect(methodsB.has('methodB')).toBe(true);
      expect(methodsB.has('methodA')).toBe(false);
    });
  });
});
