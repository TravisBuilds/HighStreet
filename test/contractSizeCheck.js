const fs = require('fs');


const TokenFactory = `client/src/build/contracts/TokenFactory.json`;
const ProductToken = `client/src/build/contracts/ProductToken.json`;
const ProductTokenV0 = `client/src/build/contracts/ProductTokenV0.json`;
const ProductTokenV1 = `client/src/build/contracts/ProductTokenV1.json`;
const ProductTokenV2 = `client/src/build/contracts/ProductTokenV2.json`;
const BancorBondingCurve = `client/src/build/contracts/BancorBondingCurve.json`;

let calculateSize = (name, path) => {
        const obj = JSON.parse(fs.readFileSync(path));
        const size = Buffer.byteLength(obj.deployedBytecode, 'utf8') / 2;
        console.log(name, 'contract size is', size);
    };

calculateSize("TokenFactory" ,TokenFactory);
calculateSize("ProductToken" ,ProductToken);
calculateSize("ProductTokenV0" ,ProductTokenV0);
calculateSize("ProductTokenV1" ,ProductTokenV1);
calculateSize("ProductTokenV2" ,ProductTokenV2);
calculateSize("BancorBondingCurve" ,BancorBondingCurve);

