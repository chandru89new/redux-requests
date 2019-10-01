import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from '../actions';
import queriesReducer from './queries-reducer';
import defaultConfig from './default-config';

describe('reducers', () => {
  describe('queriesReducer', () => {
    describe('simple', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        normalized: false,
      };
      const requestAction = {
        type: 'FETCH_BOOK',
        request: { url: '/ ' },
      };

      it('returns the same state for not handled action', () => {
        const state = { queries: {}, normalizedData: {} };
        expect(queriesReducer(state, { type: 'STH ' }, defaultConfig)).toBe(
          state,
        );
      });

      it('handles request query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            requestAction,
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: 1,
            },
          },
          normalizedData: {},
        });
      });

      it('handles success query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(requestAction, { data: 'data' }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: 'data',
            },
          },
          normalizedData: {},
        });
      });

      it('handles error query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createErrorAction(requestAction, 'error'),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              error: 'error',
            },
          },
          normalizedData: {},
        });
      });

      it('handles abort query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createAbortAction(requestAction),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
            },
          },
          normalizedData: {},
        });
      });

      it('supports FSA actions for getting data and error by default', () => {
        const action = {
          type: 'FETCH_BOOK',
          payload: {
            request: {
              url: '/',
            },
          },
        };

        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(action, { data: 'data' }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: 'data',
            },
          },
          normalizedData: {},
        });

        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createErrorAction(action, 'error'),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              error: 'error',
            },
          },
          normalizedData: {},
        });
      });
    });

    describe('with mutations', () => {
      const initialState = {
        queries: {
          FETCH_BOOK: {
            data: 'data',
            error: null,
            pending: 0,
            normalized: false,
          },
        },
        normalizedData: {},
      };

      const MUTATION_ACTION = 'MUTATION_ACTION';

      it('can update data optimistic', () => {
        expect(
          queriesReducer(
            initialState,
            {
              type: MUTATION_ACTION,
              request: { url: '/books', method: 'post' },
              meta: {
                mutations: {
                  FETCH_BOOK: {
                    updateDataOptimistic: data => `${data} suffix`,
                  },
                },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data suffix',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('keeps data updated optimistic on mutation success if updateData undefined', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateDataOptimistic: data => `${data} suffix`,
                    },
                  },
                },
              },
              { data: 'updated data' },
            ),
            defaultConfig,
          ),
        ).toEqual(initialState);
      });

      it('handles updateData customized per mutation', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: (data, mutationData) =>
                      data + mutationData.nested,
                  },
                },
              },
              { data: { nested: 'suffix' } },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'datasuffix',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles updateData customized per mutation in FSA action', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                payload: {
                  request: { url: '/books', method: 'post' },
                },
                meta: {
                  mutations: {
                    FETCH_BOOK: (data, mutationData) =>
                      data + mutationData.nested,
                  },
                },
              },
              { data: { nested: 'suffix' } },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'datasuffix',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles updateData customized per mutation defined in updateData object key', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateData: (data, mutationData) =>
                        data + mutationData.nested,
                    },
                  },
                },
              },
              { data: { nested: 'suffix' } },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'datasuffix',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('reverts optimistic update on mutation error', () => {
        expect(
          queriesReducer(
            initialState,
            createErrorAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateDataOptimistic: () => 'data2',
                      revertData: data => `${data} reverted`,
                    },
                  },
                },
              },
              'error',
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data reverted',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('doesnt change data on mutation error without optimistic update revertData', () => {
        expect(
          queriesReducer(
            initialState,
            createErrorAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateDataOptimistic: () => 'data2',
                    },
                  },
                },
              },
              'error',
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('reverts optimistic update on mutation abort', () => {
        expect(
          queriesReducer(
            initialState,
            createAbortAction({
              type: MUTATION_ACTION,
              request: { url: '/books', method: 'post' },
              meta: {
                mutations: {
                  FETCH_BOOK: {
                    updateDataOptimistic: () => 'data2',
                    revertData: data => `${data} reverted`,
                  },
                },
              },
            }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data reverted',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles local mutations', () => {
        expect(
          queriesReducer(
            initialState,
            {
              type: 'LOCAL_MUTATION_ACTION',
              meta: {
                mutations: {
                  FETCH_BOOK: {
                    local: true,
                    updateData: data => `${data} suffix`,
                  },
                },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data suffix',
              error: null,
              pending: 0,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });
    });

    describe('with normalization', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        normalized: true,
      };
      const requestAction = {
        type: 'FETCH_BOOK',
        request: { url: '/ ' },
        meta: {
          normalize: true,
        },
      };

      it('should normalize data on query success', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(requestAction, {
              data: { id: '1', name: 'name' },
            }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: '@@1',
            },
          },
          normalizedData: { '@@1': { id: '1', name: 'name' } },
        });
      });

      it('should not touch normalized data if query data is the same', () => {
        const initialState = {
          queries: {
            FETCH_BOOK: {
              data: 'data',
              pending: 0,
              error: null,
              normalized: true,
            },
          },
          normalizedData: {},
        };
        const state = queriesReducer(
          initialState,
          createSuccessAction(requestAction, { data: 'data' }),
          defaultConfig,
        );

        expect(state.normalizedData).toBe(initialState.normalizedData);
      });
    });
  });
});
