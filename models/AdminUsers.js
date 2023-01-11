module.exports = (sequelize, DataTypes) => {
	return sequelize.define('adminusers', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		priveledge: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};