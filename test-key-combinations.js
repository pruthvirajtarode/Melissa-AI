const OpenAI = require('openai');

async function testKeys() {
    const p1 = ['l', 'I']; // xvdwn_fv
    const p2 = ['I', 'l']; // C_BSeyE
    const p3 = ['l', 'I']; // _1Qciqan
    const p4 = ['I', 'l']; // TrX_nw
    const p5 = ['O', '0']; // A8_L

    for (let c1 of p1) {
        for (let c2 of p2) {
            for (let c3 of p3) {
                for (let c4 of p4) {
                    for (let c5 of p5) {
                        const key = `sk-svcacct-xvdwn${c1}fvJOynydEx7u8iOMTycL0q28gC${c2}BSeyE_ugX-${c3}1QciqanUJsW0wY6wvv9NzvaTrX${c4}nwST3BlbkFJeBUKb9EH_DcHhA8${c5}LBRsgvEyG6oMxw2GcoEEvvD0F-Two50-pugRqWTentaYrLnCOr9eCAJ58A`;

                        const openai = new OpenAI({ apiKey: key });
                        try {
                            await openai.chat.completions.create({
                                model: 'gpt-4o-mini',
                                messages: [{ role: 'user', content: 'hello' }]
                            });
                            console.log('✅ FOUND WORKING KEY:', key);
                            return;
                        } catch (err) {
                            if (err.status === 429) {
                                console.log('✅ FOUND KEY BUT OUT OF QUOTA:', key);
                                return;
                            }
                            // 401 incorrect key, continue
                        }
                    }
                }
            }
        }
    }
    console.log('❌ None of the variations worked.');
}

testKeys();
