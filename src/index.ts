import path from 'path';
import fs from 'fs'
import { inferType } from './utils/inferType';

let encoding: BufferEncoding = 'utf8';
let isInitialized = false;

const getEnvFiles = () => {
    const allEnvFiles = fs.readdirSync(process.cwd())
    .filter((filePath: string) => filePath.match(/^.env/));
    
    if(allEnvFiles.length < 1) { 
        throw new Error('no env file found')
    }

    let allEnvMap: any  = {};

    for(const filePath of allEnvFiles) {
        const envMap = parseEnvFile(filePath);
        allEnvMap = {...envMap, ...allEnvMap}
        setEnvironmentVariables(envMap);

    }
    generateTypeDeclaration(allEnvMap);
    return {...allEnvMap, ...process.env};

}


const parseEnvFile = (filePath: string): Record<string, 'string' | 'number' | 'boolean'>  => {
    const envMap: Record<string, any> = {};
    const envFile = fs.readFileSync(filePath, { encoding });
    
    envFile.split(/\r?\n/)
    .map((line: string) => {
        const [ key, value ] = line.split('=');
        envMap[key] = value.replace(/\"/g, "");
    })

    return envMap;
}

const setEnvironmentVariables = (envMap: Record<string, any>) => {
    for(const key in envMap ) {
        process.env[key] = envMap[key];
    }
}

const generateTypeDeclaration = (envMap: Record<string, 'string' | 'number' | 'boolean'>) => {
    const outputPath = path.resolve(process.cwd(), 'env.d.ts');

    console.log(envMap)
    const declarations = Object.entries(envMap)
      .map(([key, value]) => `    ${key}: ${inferType(value)};`)
      .join('\n');
      console.log(declarations)
  
    const content = `declare namespace NodeJS {
    interface Dict<T> {
        [key: string | number | boolean]: T | undefined;
    }
    interface ProcessEnv {
        ${declarations}
    }
  }`;
  fs.writeFileSync(outputPath, content);
  console.log(`Type declarations generated at ${outputPath}`);
};


export const config = () => {
    isInitialized = true;
    return getEnvFiles();
}


export const env = new Proxy(process.env, {
    get(target, key: string, proxy) {
        console.log('target[key]', target);
        if(!isInitialized) {
            throw new Error('must call config')
        }
        return target[key];
    },
});


