const fsPromises = require('fs/promises');
const simpleGit = require('simple-git');
const git = simpleGit();

(async () => {
	const files = await git.raw([ 'ls-files']);
	const fileArray = files.split('\n').filter((file) => !!file);
	const promises = fileArray.map(async (file) => {
		const info = await git.log({
			file,
			format: '%ct',
			maxCount : 1,
		});
		const updatedTime = new Date(info.latest.date)
		await fsPromises.utimes(file, updatedTime, updatedTime)
		console.log(file, info.latest.date)
	});
	await Promise.all(promises);
})();