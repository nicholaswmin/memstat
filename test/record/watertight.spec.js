import chai from 'chai'

import Heapstat from '../../index.js'
import { leaky, clearLeaks } from '../leaky.js'

chai.should()

const mbToBytes = mb => Math.ceil(mb * 1024 * 1024)

describe('#record()', function ()  {
  this.slow(1500)

  describe ('against a non-leaky function', function() {
    before(function() {
      this.nonLeakyFunction = function(a, b) {
        return new Promise(res =>
          setTimeout(() => res(a + b), 10))
      }
    })

    before('collect stats across 2 separate leaks', async function() {
      this.heapstat = Heapstat()

      await this.heapstat.record()

      this.reportA = await this.heapstat.getStats()

      let leak = ''
      for (let i = 0; i < 50; i++)
        await this.nonLeakyFunction()

      this.reportB = await this.heapstat.getStats()

      for (let i = 0; i < 50; i++)
        await this.nonLeakyFunction()

      this.reportC = await this.heapstat.getStats()

      await this.heapstat.end()
    })

    it ('records an equally small initial for all checkpoints', function() {
      this.reportA.initial.should.be.within(mbToBytes(5), mbToBytes(15))
      this.reportB.initial.should.be.within(mbToBytes(5), mbToBytes(15))
      this.reportC.initial.should.be.within(mbToBytes(5), mbToBytes(15))
    })

    it('records no increases in current between checkpoints', function() {
      this.reportA.initial.should.be.within(mbToBytes(5), mbToBytes(15))
      this.reportB.initial.should.be.within(mbToBytes(5), mbToBytes(15))
      this.reportC.initial.should.be.within(mbToBytes(5), mbToBytes(15))
    })

    it('records small increases in max between checkpoints', function() {
      this.reportA.initial.should.be.within(mbToBytes(5), mbToBytes(15))
      this.reportB.initial.should.be.within(mbToBytes(5), mbToBytes(15))
      this.reportC.initial.should.be.within(mbToBytes(5), mbToBytes(15))
    })
  })
})
