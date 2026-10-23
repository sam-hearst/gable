// Which site this deployment is. Production (gable-one.vercel.app) is the
// waitlist. Staging sets NEXT_PUBLIC_GABLE_MODE=demo in Vercel and turns on
// the MVP: search, sign-in and favorites. Unset means waitlist, so a
// deployment without the variable can never show the demo by accident.
export const isDemo = process.env.NEXT_PUBLIC_GABLE_MODE === "demo";
