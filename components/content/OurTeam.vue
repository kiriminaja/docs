<template>
  <div v-for="(developers, key) in grouped_developers" :key="key" class="mb-5 xl:mb-10">
      <h3 v-text="key" class="text-xl xl:text-2xl mb-3 font-bold"></h3>
    <div class="grid grid-cols-2 xl:grid-cols-6 gap-5 xl:gap-7">
      <div class="group" v-for="developer in developers" :key="developer.name">
        <div
            class="aspect-square mb-3 border-2 border-transparent group-hover:border-primary-300 rounded-2xl group-hover:rounded-3xl transition-all overflow-hidden">
          <img v-bind:src="developer.image" loading="lazy" v-bind:alt="developer.name"
               class="group-hover:scale-110 transition-all w-full"/>
        </div>
        <div>
          <h4 class="font-bold text-lg group-hover:text-primary-700 dark:group-hover:text-primary-300"
              v-text="developer.name"></h4>
          <span class="text-xs text-neutral-material-700 dark:text-neutral-material-400"
                v-text="developer.position"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OurTeam",
  data() {
    return {
      teams: [
        {
          code: 'muhammad-ih',
          name: "Muhammad Irfan H",
          position: "Chief Technology Officer",
          group: "Leaders",
          image: "/teams/muh_irfan_herawan.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/muhammad-ih-932b96125/'
          }
        },
        {
          code: 'ilham-hp',
          name: "Ilham Hary Prayitno",
          position: "General IT Manager",
          group: "Leaders",
          image: "/teams/ilham_hary.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/ilham-hary-prayitno/'
          }
        },
        {
          code: 'yanuar',
          name: "Yanuar Aditia",
          position: "Product Manager",
          group: "Leaders",
          image: "/teams/yanuar_aditia.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/yanuaraditia/'
          }
        },
        {
          code: 'daewu',
          name: "Daewu Gus BP",
          position: "Feature Lead",
          group: "Leaders",
          image: "/teams/daewu_bintara.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/daewu-bintara-92959299/'
          }
        },
        {
          code: 'faiz',
          name: "Faiz Razzak",
          position: "Front-End Developer",
          group: "Production",
          image: "/teams/faiz_razzak.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/faizra/'
          }
        },
        {
          code: 'ilham-ap',
          name: "Ilham Arifin P",
          position: "UI / UX Designer",
          group: "Production",
          image: "/teams/ilham_arifin.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/ilhamarifinpambudi/'
          }
        },
        {
          code: 'anggy-dp',
          name: "Anggy Dian P",
          position: "Backend Developer",
          group: "Production",
          image: "/teams/anggy.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/anggy-dian-pratama-310300136/'
          }
        },
        {
          code: 'bima',
          name: "Bima Aji Nugraha",
          position: "Superman Support",
          group: "Production",
          image: "/teams/bima_aji_nug.png",
          socials: {}
        },
        {
          code: 'ageng',
          name: "Ageng Hadi P",
          position: "Data Analyst",
          group: "Production",
          image: "/teams/ageng_hadi.png",
          socials: {}
        },
        {
          code: 'alexandro',
          name: "Alexandro Aprilianto",
          position: "QA Production",
          group: "Production",
          image: "/teams/alexandro.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/alexandroaprilianto'
          }
        },
        {
          code: 'enno',
          name: "Enno Destias R",
          position: "QA Production",
          group: "Production",
          image: "/teams/enno.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/alexandroaprilianto'
          }
        },
        {
          code: 'gemgem',
          name: "Gema Antika H",
          position: "Tauku Lead",
          group: "Leaders",
          image: "/teams/gema.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/gemaantikahr/'
          }

        },
        {
          code: 'lalu',
          name: "Lalu Ahdiyat",
          position: "Backend Developer",
          group: "Production",
          image: "/teams/lalu.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/gemaantikahr/'
          }

        },
        {
          code: 'tama',
          name: "Setya Kristyastama",
          position: "Flutter Developer",
          group: "Production",
          image: "/teams/tama.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/christyastama/'
          }
        },
        {
          code: 'gontang',
          name: "Gontang R Prakasa",
          position: "Vendor & 3rd Party",
          group: "Leaders",
          image: "/teams/gontang.png",
          socials: {
            linkedin: 'https://www.linkedin.com/in/gontang-ragil-prakasa-65766b131'
          }
        }]
    }
  },
  computed: {
    grouped_developers() {
      const groupBy = (array, key) => {
        // Return the end result
        return array.reduce((result, currentValue) => {
          // If an array already present for key, push it to the array. Else create an array and push the object
          (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
          );
          // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
          return result;
        }, {}); // empty object is the initial value for result object
      };
      return groupBy(this.teams,'group')
    }
  }
}
</script>

<style scoped>

</style>
