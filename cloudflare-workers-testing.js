const workerUrl = 'https://vitrineform-relay.onrender.com/relays/vitrineform';

(async () => {
    const url = new URL(workerUrl);

    const body =  {
      email: "ping@you",
      phone: "511",
      locale: "fr",
      toEmail: "mohas191.bot@gmail.com",
      message: "this is test",
      hostname: "test.com",
    };
 
    const r = await fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    console.log(r.status, r.statusText);
    console.log(await r.text());
    for (const [key, value] of r.headers.entries()) {
        //console.log(`${key}: ${value}`);
    }
})()