/* tslint:disable max-classes-per-file no-empty-interface */

import 'jest'
import * as ko from 'knockout'
import '@profiscience/knockout-contrib-jest-matchers'

import { DataModelConstructorBuilder, INITIALIZED } from './DataModelConstructorBuilder'

describe('DataModelConstructorBuilder', () => {

  test('requires .fetch() implementation', async () => {
    class FooModel extends DataModelConstructorBuilder<{}> {}

    const foo = new FooModel({})

    await expect((foo as any)[INITIALIZED]).rejects.toBeTruthy()

    // tslint:disable-next-line no-console
    console.error('The preceeding error is expected')
  })

  test('uses .fetch() to initialize data and maps to observables', async () => {
    interface IFooParams { }

    class FooModel extends DataModelConstructorBuilder<IFooParams> {
      public readonly value: KnockoutObservable<string>

      protected async fetch() {
        return { value: 'value' }
      }
    }

    const foo = await FooModel.create({})

    expect(foo.value).toBeObservable()
    expect(foo.value()).toBe('value')
  })

  test('uses SubscriptionDisposalMixin', () => {
    interface IFooParams { }

    class FooModel extends DataModelConstructorBuilder<IFooParams> {
      public readonly value: KnockoutObservable<string>

      protected async fetch() {
        return { value: 'value' }
      }
    }

    const foo = new FooModel({})

    expect(foo.subscribe).toBeDefined()
    expect(foo.dispose).toBeDefined()
  })

  test('updates model when params are changed', async () => {
    interface IFooParams {
      valueIn: KnockoutObservable<string>
    }

    class FooModel extends DataModelConstructorBuilder<IFooParams> {
      public readonly value: KnockoutObservable<string>

      protected async fetch() {
        return { value: this.params.valueIn() }
      }
    }

    const params: IFooParams = { valueIn: ko.observable('foo') }
    const foo = await FooModel.create(params)

    expect(foo.value()).toBe('foo')
    params.valueIn('bar')

    expect(foo.loading()).toBe(true)
    await new Promise((resolve) => {
      const sub = foo.value.subscribe((newVal) => {
        sub.dispose()
        resolve()
      })
    })

    expect(foo.loading()).toBe(false)
    expect(foo.value()).toBe('bar')
  })

  test('.toJS() returns unwrapped data', async () => {
    class FooModel extends DataModelConstructorBuilder<{}> {
      public value: KnockoutObservable<string>

      protected async fetch() {
        return { value: 'foo' }
      }
    }

    const foo = await FooModel.create({})

    expect(foo.toJS()).toEqual({
      value: 'foo'
    })
  })
})