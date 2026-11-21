export type ProjectNote = {
  id: string; title: string; summary: string; body: string;
  status: "Idea" | "Prototype" | "In progress" | "Complete";
  category: string; updatedAt: string; revision: number;
};
export const seedNotes: ProjectNote[] = [
  {
    id: "hot-cold", title: "Hot / Cold",
    summary: "Find a person or a hidden object. Let your phone—and the room—tell you when you’re getting warmer.",
    status: "Prototype", category: "Play & physical computing", updatedAt: "2026-11-20T19:00:00-05:00", revision: 0,
    body: `## The idea
A proximity hide-and-seek game for a mix of iPhones and Android phones. Players use their phone to find a person carrying another participating phone, or an object fitted with a compatible tag.

Feedback becomes warmer as the seeker approaches and colder after they pass the target. The planned Oasis integration extends those clues into the room through brightness and warmth.

## How it could work
- Phone to phone: both people join a game; the seeker follows visual, vibration, or sound cues.
- Phone to object: a compatible UWB tag makes a hidden object discoverable.
- Passing the target: the feedback warms up on approach and cools down after passing it.
- Oasis lights: dim when far away, brighter and warmer when close, with a distinct found state.

## Build direction
Use ultra-wideband (UWB) for distance measurements on compatible devices. Begin with one iPhone and one Android phone, both running the game in the foreground. Cross-platform support needs testing on the selected models and operating systems.

Add tagged objects once phone-to-phone ranging works. Test a few distinct lighting states and measure Oasis response time before attempting continuous effects.

The interactive preview is a simulation. Live ranging and Oasis control are not connected.

## Open questions
- Which exact iPhone and Android models are available for testing?
- Which Oasis brand and model do we have? Mixtiles Oasis is the current assumption, not yet confirmed.
- How reliably do distance readings respond when someone walks past the target?

## References
- [Apple Nearby Interaction](https://developer.apple.com/documentation/nearbyinteraction)
- [Android and iOS UWB interoperability](https://developer.android.com/develop/connectivity/ranging#uwb-interoperability)
- [Unofficial Oasis integration](https://github.com/longweekendprojects/oasis-lights)`,
  },
  {
    id: "intro-format", title: "Intro format", summary: "From a whiteboard sketch to a visual demo.",
    body: "Start each intro with sketching the idea on the whiteboard and then turning it into a visual demo.",
    status: "Idea", category: "Creative process", updatedAt: "2026-11-20T19:15:00-05:00", revision: 0,
  },
  {
    id: "2697341b-1d3d-40ce-b3e7-b70f6b75f5b5", title: "You run faster than a…",
    summary: "A stopwatch-style idea: time a run from point A to point B, then match the runner’s speed to an animal.",
    category: "Play & movement", status: "Idea", updatedAt: "2026-11-20T20:00:00-05:00", revision: 0,
    body: `## The idea
A stopwatch-style experience that clocks how fast a person runs from point A to point B.

## First version
Set the distance between A and B, start the stopwatch when the runner leaves A, and stop it when they reach B. Use the distance and elapsed time to calculate their average running speed.

## Where it could go
Eventually, match the runner to an animal that runs at a similar speed, with a playful result: “You run as fast as a…” or “You run faster than a…”

This is an idea for now; the stopwatch and animal matching are still to be built.`,
  },
];
