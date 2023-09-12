import Role from '../model/Role';

class RoleClass {

    async roles() {
        return await Role.find();
    }

    async roleUser()
    {
        let role = await Role.findOne({name: 'User'});
        return role ? role._id : null;
    }

    async roleAdmin()
    {
        let role = await Role.findOne({name: 'Librarian'});
        return role ? role._id : null;
    }
}

export default new RoleClass()
