import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function addCouponToCustomer({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const customerModuleService = container.resolve(Modules.CUSTOMER);

    const TARGET_EMAIL = process.env.TARGET_EMAIL;
    const COUPON_CODE = process.env.COUPON_CODE;

    if (!TARGET_EMAIL || !COUPON_CODE) {
        logger.error("TARGET_EMAIL and COUPON_CODE environment variables are required.");
        return;
    }

    logger.info(`Looking for customer with email: ${TARGET_EMAIL}`);

    const customers = await customerModuleService.listCustomers({
        email: TARGET_EMAIL,
    });

    if (!customers.length) {
        logger.error(`Customer with email ${TARGET_EMAIL} not found.`);
        return;
    }

    const customer = customers[0];
    logger.info(`Found customer: ${customer.first_name} ${customer.last_name} (${customer.id})`);

    // Get existing coupons or initialize empty array
    const existingCoupons = (customer.metadata?.coupons as string[]) || [];

    if (existingCoupons.includes(COUPON_CODE)) {
        logger.info(`Customer already has coupon ${COUPON_CODE}. Skipping.`);
        return;
    }

    const newCoupons = [...existingCoupons, COUPON_CODE];

    await customerModuleService.updateCustomers(customer.id, {
        metadata: {
            ...customer.metadata,
            coupons: newCoupons
        },
    });

    logger.info(`Successfully added coupon ${COUPON_CODE} to customer metadata.`);
    logger.info(`Current coupons: ${newCoupons.join(", ")}`);
}
