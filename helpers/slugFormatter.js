module.exports = {
    slugFormatter: function (str) {
        const a = 'àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
        const b = 'aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
        const p = new RegExp(a.split('').join('|'), 'g')
        return str.toString().toLowerCase().trim()
            .replace(p, c => b.charAt(a.indexOf(c)))
            .replace(/&/g, '-and-')
            .replace(/[\s\W-]+/g, '-')
    }
}