const app = require("../../../server");
const supertest = require("supertest");
const request = supertest(app);


describe('Testing endpoints', () => {
    it('should return status code 400 (duplicate user)', async () => {
        const res = await request.post("/api/signup").send({
            "username": "nodeOpernResy",
            "email": "moradi@test.com",
            "password": "Twu5hKXXKZEQaJ"
        });
        expect(res.status).toBe(400);
    });

    // it('should return status code 200', async () => {
    //     const res = await request.post("/api/signup").send({
    //         "username": "moradi12",
    //         "email": "moradi1@test.com",
    //         "password": "123456"
    //     });
    //     expect(res.status).toBe(200);
    // });

    it('should sign in with token', async () => {
        const res = await request.post("/api/signin").send({
            "username": "nodeOpernResy",
            "password": "Twu5hKXXKZEQaJ"
        });
        console.log(res.body.accessToken);
        expect(res.status).toBe(200);
        expect(typeof res.body.accessToken).toBe("string")
    });
});