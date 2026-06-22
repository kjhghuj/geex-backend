export interface ProductStorySection {
  id: string
  title: string
  content: string
  imageUrl: string
  imageAlt: string
}

export const PRODUCT_STORIES: Record<string, ProductStorySection[]> = {
  "geex-a75-mechanical-keyboard": [
    {
      id: "geex-a75-mechanical-keyboard-story-1",
      title: "Built for the desk you return to every day",
      content:
        "The A75 starts with the rhythm of daily work: quick notes, long documents, late revisions, and the small shortcuts that keep a clean setup moving. Its compact 75% layout keeps the important keys close without crowding the mouse area, while the gasket-style feel and PBT keycaps give every press a calmer, more deliberate sound.",
      imageUrl:
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Low-profile mechanical keyboard on a clean desktop",
    },
    {
      id: "geex-a75-mechanical-keyboard-story-2",
      title: "A keyboard that adapts instead of taking over",
      content:
        "Use it wired when the desk is fixed, switch to wireless when the setup needs to breathe, and swap switches when your typing preference changes. The A75 is meant to feel like part of the workspace, not a loud centerpiece: precise enough for focus, compact enough for small desks, and practical enough to stay there.",
      imageUrl:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Compact keyboard detail with clean keycaps",
    },
  ],
  "geex-m2-pro-wireless-mouse": [
    {
      id: "geex-m2-pro-wireless-mouse-story-1",
      title: "Light in the hand, steady on the screen",
      content:
        "The M2 Pro is designed for the split life of a modern desk: editing spreadsheets at noon, gaming after hours, and jumping between tabs all day. Its lightweight shell keeps movement easy, while the tuned sensor and low-latency wireless connection help cursor movement feel direct, predictable, and under control.",
      imageUrl:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Wireless mouse beside a gaming keyboard",
    },
    {
      id: "geex-m2-pro-wireless-mouse-story-2",
      title: "Comfort that disappears into the task",
      content:
        "A good mouse should not ask for attention. The M2 Pro uses a familiar shape, programmable controls, and a smooth glide so the hand can settle in and the work can keep moving. It is equally at home in a tidy office setup or a faster gaming desk where every small movement matters.",
      imageUrl:
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Black wireless mouse on a desk surface",
    },
  ],
  "geex-pods-x1": [
    {
      id: "geex-pods-x1-story-1",
      title: "Made for the moments between places",
      content:
        "Pods X1 are built for the parts of the day that do not stay still: walking into calls, catching a video on the train, or switching from phone to laptop before the next meeting starts. The compact case, USB-C charging, and quick pairing keep the routine simple, so the audio is ready before the moment passes.",
      imageUrl:
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Wireless earbuds in a compact charging case",
    },
    {
      id: "geex-pods-x1-story-2",
      title: "Clear calls, easy videos, less waiting",
      content:
        "The low-latency mode keeps speech and motion closer together when watching clips or playing casual games, while the call pickup is tuned for everyday conversations. Pods X1 are not trying to turn every commute into a studio session; they are made to be dependable, pocketable, and ready whenever the day changes pace.",
      imageUrl:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Wireless earbuds arranged on a neutral surface",
    },
  ],
  "geex-desk-mat-pro-xl": [
    {
      id: "geex-desk-mat-pro-xl-story-1",
      title: "The surface that pulls the setup together",
      content:
        "A desk mat is the quiet foundation of a workspace. Desk Mat Pro XL gives the keyboard, mouse, and daily carry a defined place to live, turning scattered gear into one clear zone. The smooth control surface keeps mouse movement consistent, while stitched edges help it handle long days without fraying into the routine.",
      imageUrl:
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Large desk mat anchoring a clean workspace",
    },
    {
      id: "geex-desk-mat-pro-xl-story-2",
      title: "More room for work, play, and small habits",
      content:
        "The XL size gives your mouse space to travel and your keyboard room to sit without feeling boxed in. It protects the desk, softens the sound of gear, and creates a visual reset every time you sit down. Simple, steady, and easy to live with, it is the kind of upgrade you notice by not noticing it.",
      imageUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Minimal desk setup with space for keyboard and mouse",
    },
  ],
  "geex-100w-usb-c-cable": [
    {
      id: "geex-100w-usb-c-cable-story-1",
      title: "One cable for the devices that carry the day",
      content:
        "The 100W USB-C Cable is made for the gear that moves between desk, bag, and nightstand. It has the power headroom for laptops and tablets, but stays flexible enough for phones, docks, and travel chargers. Reinforced connectors help it survive the bends and pulls that cheaper cables quietly fail.",
      imageUrl:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "USB-C charging cable coiled on a desk",
    },
    {
      id: "geex-100w-usb-c-cable-story-2",
      title: "Less cable clutter, more trust",
      content:
        "A reliable cable removes one small uncertainty from the day. Keep it plugged into a dock, pack it with a compact charger, or leave it on the desk for the device that needs power next. The braided build and practical length make it feel ready for everyday use rather than reserved for emergencies.",
      imageUrl:
        "https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "USB-C cable and mobile accessories near a tablet",
    },
  ],
  "geex-adjustable-tablet-stand": [
    {
      id: "geex-adjustable-tablet-stand-story-1",
      title: "Raise the screen, clear the desk",
      content:
        "The Adjustable Tablet Stand turns a phone or tablet into a useful part of the workspace instead of another flat object on the desk. Lift it for video calls, tilt it for notes, or park it beside a laptop as a second screen. Stable hinges hold the angle so the setup stays intentional.",
      imageUrl:
        "https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Tablet and phone stand on a clean desk",
    },
    {
      id: "geex-adjustable-tablet-stand-story-2",
      title: "Foldable support for changing routines",
      content:
        "Some days the tablet is for calls, some days it is for recipes, sketches, reading, or messages beside the main screen. The foldable aluminum build keeps the stand easy to move without feeling disposable, giving your devices a better angle wherever the day asks them to work.",
      imageUrl:
        "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Tablet standing upright for reading and calls",
    },
  ],
  "geex-orbit-dock-7-in-1": [
    {
      id: "geex-orbit-dock-7-in-1-story-1",
      title: "A cleaner desk starts with one connection",
      content:
        "Orbit Dock 7-in-1 is for the laptop that needs to become a full desk in seconds. HDMI, USB-A, USB-C power pass-through, card access, and Ethernet support come together in one compact hub, so the monitor, keyboard, network, and storage can stop competing for the same single port.",
      imageUrl:
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Compact USB-C hub with laptop accessories",
    },
    {
      id: "geex-orbit-dock-7-in-1-story-2",
      title: "Built for hybrid desks and quick resets",
      content:
        "Whether the workspace is permanent or rebuilt every morning, a dock should make reconnecting feel automatic. Orbit Dock keeps essential ports close without turning the desk into a cable nest. It is small enough to travel, useful enough to leave plugged in, and practical enough for the devices people actually use.",
      imageUrl:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Laptop desk setup with connected accessories",
    },
  ],
  "geex-control-pad": [
    {
      id: "geex-control-pad-story-1",
      title: "Put repeated actions under one hand",
      content:
        "Control Pad is built for the shortcuts that happen too often to stay hidden in menus. Mute a call, launch a scene, trigger a macro, or keep creative tools close without reaching across the keyboard. Its compact footprint gives creators, gamers, and power users a dedicated command zone.",
      imageUrl:
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Compact keyboard controls for shortcuts and macros",
    },
    {
      id: "geex-control-pad-story-2",
      title: "Small keys for faster rituals",
      content:
        "The best shortcuts become muscle memory. Tactile keys, swappable legends, and USB-C connectivity make Control Pad easy to adapt to the way you actually work or play. It is not about adding more hardware for its own sake; it is about moving the small repeatable actions closer to your fingertips.",
      imageUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=90&w=1200",
      imageAlt: "Gaming desk controls and keyboard lighting",
    },
  ],
}

export function getProductStorySections(handle: string): ProductStorySection[] {
  return PRODUCT_STORIES[handle] ?? []
}

export function buildProductStoryMetadata(
  handle: string,
  metadata?: Record<string, unknown> | null
): Record<string, unknown> {
  const storySections = getProductStorySections(handle)

  return {
    ...(metadata ?? {}),
    story_sections: storySections,
  }
}
