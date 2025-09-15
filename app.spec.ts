import {calculateDiscount} from "./src/utils";
describe('App', () => {
    it("should give correct value", () => {
        const discount = calculateDiscount(100, 10);
        expect(discount).toBe(10);
    });
    });