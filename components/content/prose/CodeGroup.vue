<script lang="ts">
import TabsHeader from './TabsHeader.vue'

const isTag = (slot: any, tag: string) => {
  return slot.type && slot.type.tag && slot.type.tag === tag
}

export default defineComponent({
  data () {
    return {
      activeTabIndex: 0,
      /**
       * A simple number that increases on every changes
       */
      counter: 0
    }
  },
  render () {
    const slots = this.$slots?.default?.() || []
    const tabs = slots
      .map((slot, index) => {
        return {
          label: slot?.props?.filename || slot?.props?.label || `${index}`,
          active: slot?.props?.active || false,
          component: slot
        }
      })

    return h(
      'div',
      {
        class: {
          'code-group': true,
          'bg-outlineVariant': true,
          'rounded-md': true,
          'overflow-hidden': false,
          'first-tab': this.activeTabIndex === 0
        }
      },
      [
        h(TabsHeader, {
          ref: 'tabs-header',
          activeTabIndex: this.activeTabIndex,
          tabs,
          'onUpdate:activeTabIndex': $event => (this.activeTabIndex = $event)
        }),
        h(
          'div',
          {
            class: 'code-group-content',
            text: this.activeTabIndex
          },
          // Map slots to content children
          slots.map((slot, index) =>
            h(
              'div',
              {
                // Current slot is displayed, others are hidden
                style: {
                  display: index === this.activeTabIndex ? 'block' : 'none'
                },
                class: {
                  '': !isTag(slot, 'code') && !isTag(slot, 'pre')
                }
              },
              // Display direct children if not a ```code``` block
              [
                isTag(slot, 'code') || isTag(slot, 'pre')
                  ? slot
                  : h(
                    'div',
                    {
                      class: {
                        'preview-canvas': true
                      }
                    },
                    [(slot.children as any)?.default?.() || slot.children]
                  )
              ]
            )
          )
        )
      ]
    )
  }
})
</script>
<style>
.code-group-content pre {
  margin: 0;
}
.code-group-content pre {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
