<template>
      <div class="grid xl:grid-cols-5 xl:mt-10">
        <div class="xl:col-span-2">
          <div class="border relative rounded-lg overflow-hidden dark:border-neutral-600 mb-3">
            <small class="absolute pointer-events-none top-3.5 left-5">Ekspedisi</small>
            <select class="w-full pl-5 pb-3.5 pr-9 pt-9 appearance-none rounded-lg dark:bg-neutral-700" v-model="params.selected_courier">
              <option v-for="exp in options" :key="`cou-${exp.label}`" :value="exp.label" v-text="exp.label"></option>
            </select>
          </div>
          <div class="border relative rounded-lg overflow-hidden dark:border-neutral-600 mb-3">
            <small class="absolute pointer-events-none top-3.5 left-5">Nilai Barang</small>
            <input type="number" v-model="params.item_price" placeholder="Nilai Barang" class="w-full dark:bg-neutral-700 px-5 pb-3.5 pt-9 rounded-lg">
          </div>
          <div class="border relative rounded-lg overflow-hidden dark:border-neutral-600 mb-3">
            <small class="absolute pointer-events-none top-3.5 left-5">Ongkos Kirim</small>
            <input type="number" v-model="params.shipping_cost" placeholder="Ongkos Kirim" class="w-full dark:bg-neutral-700 px-5 pb-3.5 pt-9 rounded-lg">
          </div>
          <div class="border relative rounded-lg overflow-hidden dark:border-neutral-600 mb-3 dark:bg-neutral-700">
            <input type="checkbox" v-model="params.use_insurance" class="absolute left-5 top-1/2 -translate-y-1/2" id="vehicle2" name="vehicle2" value="true">
            <label for="vehicle2" class="pl-10 select-none py-3 block">Gunakan Asuransi</label>
          </div>
        </div>
        <div class="xl:col-span-3">
          <div class="sticky top-24 xl:w-9/12 ml-auto">
            <div class="w-full prose max-w-none dark:prose-invert">
              <table class="max-w-none">
                <tbody>
                <tr>
                  <td>Nilai Barang</td>
                  <td class="text-right" v-text="formatter(params.item_price)"></td>
                </tr>
                <tr>
                  <td>Ongkos Kirim</td>
                  <td class="text-right" v-text="formatter(params.shipping_cost)"></td>
                </tr>
                <tr v-if="params.use_insurance">
                  <td>Biaya Asuransi (Real)</td>
                  <td class="text-right" v-text="formatter(insurance_amount.real)"></td>
                </tr>
                <tr v-if="params.use_insurance">
                  <td>Biaya Asuransi</td>
                  <td class="text-right">
                    <span v-text="formatter(insurance_amount.rounded)"></span>
                    <small v-text="`(${selected_courier.insurance}%)`"></small>
                  </td>
                </tr>
                <tr>
                  <td>Biaya COD</td>
                  <td class="text-right" v-text="formatter(cod_fee)"></td>
                </tr>
                </tbody>
              </table>
            </div>
            <hr>
            <div class="mt-3 grid grid-cols-2">
              <div class="font-semibold">
                <span>Ditagihkan</span>
              </div>
              <div class="text-right font-medium">
                <span v-text="formatter(cod_value)"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>
<script>
export default {
  data() {
    return {
      params: {
        item_price: 115000,
        shipping_cost: 20000,
        selected_courier: "Sicepat",
        use_insurance: true
      },
      options: [
        {
          label: "Sicepat",
          insurance: 0.25,
          insurance_add_cost: 0,
          cod_fee: 3,
          cod_fee_minimum: 2500
        },
        {
          label: "JNE Express",
          insurance: 0.2,
          insurance_add_cost: 5000,
          cod_fee: 3,
          cod_fee_minimum: 2500
        }
      ]
    }
  },
  computed: {
    selected_courier() {
      let option
      this.options.map((value, key) => {
        if (this.params.selected_courier === value.label) {
          option = value
        }
      })
      return option
    },
    sub_total() {
      if (this.params.item_price > 0 && this.params.shipping_cost > 0) {
        let value = +this.params.item_price
        value += +this.insurance_amount.rounded
        value += +this.params.shipping_cost
        return value
      }
      return 0
    },
    cod_value() {
      return this.sub_total + this.cod_fee
    },
    cod_fee() {
      if (this.params.item_price > 0 && this.params.shipping_cost > 0) {
        let value = this.sub_total

        let cod_fee = (value * (this.selected_courier.cod_fee / 100))
        if (cod_fee <= this.selected_courier.cod_fee_minimum) {
          return this.selected_courier.cod_fee_minimum
        }
        return cod_fee
      }
      return 0
    },
    insurance_amount() {
      let real = 0
      let rounded = 0
      if (this.params.item_price > 0 && this.params.use_insurance) {
        real = this.params.item_price * (this.selected_courier.insurance / 100)
        real += this.selected_courier.insurance_add_cost
        rounded = Math.ceil(real / 100) * 100
      }
      return {
        real,
        rounded
      }
    }
  },
  methods: {
    formatter(string) {
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',

        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
      });
      return formatter.format(string)
    }
  }
}
</script>
