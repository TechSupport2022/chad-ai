import BillingForm from "@/components/BillingForm"
import { getUserSubscriptionPlan } from "@/lib/stripe"

const Page = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan()

    return <div>Hello</div>
   //  return <BillingForm subscriptionPlan={subscriptionPlan} /> 
}

export default Page