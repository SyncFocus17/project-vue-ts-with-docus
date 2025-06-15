export default {
    async getAll() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        name: "Privéles",
                        description: "Privéles 2,5 uur – één persoon per les",
                        price: 175,
                        duration: 2.5,
                        lessonCount: 1,
                        maxPersons: 1,
                        status: "active"
                    },
                    {
                        id: 2,
                        name: "Losse Duo Kiteles",
                        description: "Losse Duo Kiteles 3,5 uur – maximaal 2 personen per les",
                        price: 135,
                        duration: 3.5,
                        lessonCount: 1,
                        maxPersons: 2,
                        status: "active"
                    },
                    {
                        id: 3,
                        name: "Kitesurf Duo lespakket 3 lessen",
                        description: "Kitesurf Duo lespakket 3 lessen 10,5 uur – maximaal 2 personen per les, 3 dagdelen",
                        price: 375,
                        duration: 3.5,
                        lessonCount: 3,
                        maxPersons: 2,
                        status: "active"
                    },
                    {
                        id: 4,
                        name: "Kitesurf Duo lespakket 5 lessen",
                        description: "Kitesurf Duo lespakket 5 lessen 17,5 uur – maximaal 2 personen per les, 5 dagdelen",
                        price: 675,
                        duration: 3.5,
                        lessonCount: 5,
                        maxPersons: 2,
                        status: "active"
                    }
                ]);
            }, 500);
        });
    }
};