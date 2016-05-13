# handlebars-cmd

Invoke handlebars from the commandline. 

Example:

    echo "Hello {{name}}" | handlebars --name Test

Output:

    Hello Test

You may also pass a JSON string as an argument and it will be 
interpreted as an object.


You can also pass a JSON file:

    handlebars file.json < template.hbs > output.txt

# install

    npm install -g handlebars-cmd

# include helper

handlebars-cmd comes with a built-in helper `#include`
    
    {{{include 'api.md'}}}

You can also pass context (optional)
    
    {{{include 'render.md.hbs' item}}}

# license

MIT
