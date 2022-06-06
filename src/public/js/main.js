
$(document).ready(() => {
    $("#btns-filters > input").on("input", function (){
        var data = {
            search: $(this).val()
        };
        if (data.search) {
            $.getJSON("/search", data, (response, status) => {
                //var valueSearch = this.url.split("=")[1];
                if (status === 'success' && (response.literals && response.literals.length > 0)) {
                    if ($("#list-literals").is(":visible")) {
                        $('#list-literals-filters').show();
                        $('#list-literals').hide();
                    }

                    buildDataFilters(response);
                }
            });

        } else if ($("#list-literals-filters").is(":visible")) {
            $('#list-literals-filters').hide();
            $('#list-literals').show();
        }
    });

    $("#name-literal").on("input", function () {
        var _value = $(this).val();
        _value = _value.replace(" ", "_");
        $(this).val(_value.toUpperCase());
    });

    if (window.location.pathname.includes('projects')) {
        var splitPro = window.location.pathname.split('projects');
        var id = splitPro[1].split('/')[1];
        var idMenu = `#menu-${id}`;

        $(idMenu).addClass('active2');
    }

    $(".import-event").click(function (){
        $('#spinner-import').removeClass('d-none');
        $('#dropdownImportButton').addClass('disabled');
    });

    // form new/update literal
    $("#ul-langs li").each(function (){
        var aId = $(this).children().attr('id');
        var lang = (aId.split('-').length === 3) ? aId.split('-')[2] : '';
        var textarea = $("#textarea-" + lang).val();

        if (textarea.length === 0) {
            $('#' + aId).addClass('text-danger');
        } else {
            $('#' + aId).removeClass('text-danger');
        }

        $("#textarea-" + lang).on("change keyup paste", function (){
            var _value = $(this).val();
            if (_value.length === 0) {
                $('#' + aId).addClass('text-danger');
            } else {
                var textHtml = $('#' + aId).html();
                $('#' + aId).removeClass('text-danger');
                if (!textHtml.includes('*')) {
                    $('#' + aId).html($('#' + aId).html() + '*');
                }
            }
        });
    });

    // IMPORT
    var formJsonLangs = $('#form-import').serializeArray()
        .reduce((json, { name, value }) => {
            if (name.includes('langs'))
                json[name] = value;
            return json;
        }, {});

    for (const key in formJsonLangs) {
        if (Object.hasOwnProperty.call(formJsonLangs, key)) {
            const selectorId = $(`[name='${key}']`).attr('id');
            const idTextareaLang = '#' + selectorId;
            const idTabLang = '#' + selectorId.replace('textarea', 'tab');
            const value = formJsonLangs[key];
            if (value.length === 0) {
                $(idTabLang).addClass('text-danger');
            } else {
                $(idTabLang).removeClass('text-danger');
            }

            $(idTextareaLang).on("change keyup paste", function (){
                var _value = $(this).val();
                if (_value.length === 0) {
                    $(idTabLang).addClass('text-danger');
                } else {
                    var textHtml = $(idTabLang).html();
                    $(idTabLang).removeClass('text-danger');
                    if (!textHtml.includes('*')) {
                        $(idTabLang).html($(idTabLang).html() + '*');
                    }
                }
            });
        }
    }

    // validate form import
    const _arrIds = [];
    $('#form-import').serializeArray().forEach((json) => {
        const numbers = json.name.match(/\d+/g);
        if (numbers && numbers.length > 0 && !_arrIds.includes(numbers[0])) {
            _arrIds.push(numbers[0]);
        }
    });

    // select project call ajax to get duplicate or not name literal
    _arrIds.forEach((id) => {
        const selectorProject = $(`[name='importform[${id}][idProject]']`);
        const selectorNameLit = $(`[name='importform[${id}][nameLiteral]']`);
        selectorNameLit.on("input", () => {
            var _value = selectorNameLit.val();
            _value = _value.replace(" ", "_");
            selectorNameLit.val(_value.toUpperCase());
        });

        selectorProject.change((e) => {
            const valueLiteral = selectorNameLit.val();
            const valueIdProject = selectorProject.val();

            if (valueLiteral) {
                const _data = { idProject: valueIdProject, nameLiteral: valueLiteral };
                existLiteralSelectedProject(_data, selectorNameLit, id)
                    .always(() => {
                        eventInputLiteral(id, selectorNameLit, selectorProject, _data);
                    });
            }
        });
    });

    $('#btn-form-import').click(function (){
        _arrIds.forEach((id) => {
            const selectorProject = $(`[name='importform[${id}][idProject]']`);
            const selectorNameLit = $(`[name='importform[${id}][nameLiteral]']`);
            const _valueProject = selectorProject.val();
            const _valueNameLit = selectorNameLit.val();

            if (!_valueProject) {
                selectorProject.addClass('is-invalid');
                selectorProject.parent().addClass('has-danger');
                $(`#collapse${id}`).addClass('show');
            } else {
                selectorProject.removeClass('is-invalid');
                selectorProject.parent().removeClass('has-danger');
            }


            if (!_valueNameLit) {
                selectorNameLit.addClass('is-invalid');
                selectorNameLit.parent().addClass('has-danger');
                $(`#collapse${id}`).addClass('show');
            } else {
                selectorNameLit.removeClass('is-invalid');
                selectorNameLit.parent().removeClass('has-danger');
            }
        });
        //e.preventDefault();
    });




    // ********************* FUNCTIONS *********************
    const buildDataFilters = (dataFilters) => {
        var html = '';
        dataFilters.literals.forEach(element => {
            html += `<a href="/projects/${dataFilters.idProject}/literal/${element.id}" id="projects-${dataFilters.idProject}-literal-${element.id}" class="list-group-item list-group-item-action flex-column align-items-start" aria-current="true">`;
            html += `<div class="d-flex w-100 justify-content-between">`;
            html += `<h5 class="mb-1">${element.name}</h5>`;
            html += `<small class="text-muted">${element.infoLangs}</small>`;
            html += `</div>`;
            html += `<small class="mb-1 text-muted">${element.langs.ES}</small>`;
            html += `</a>`;
        });

        $('#list-literals-filters').html(html);
    };

    const existLiteralSelectedProject = (data, selector, id) => {
        return $.getJSON("/import-info", data, (response, status) => {
            if (status === 'success' && response.existLiteral) {
                selector.addClass('is-invalid');
                selector.parent().addClass('has-danger');
                $(`#error-exist-${id}`).show();
                $(`#error-valid-${id}`).hide();
            } else {
                selector.removeClass('is-invalid');
                selector.parent().removeClass('has-danger');
            }
        });
    };
    const eventInputLiteral = (id, selectorNameLit, selectorProject, data) => {
        selectorNameLit.on("change keyup paste", (e) => {
            const _value = selectorNameLit.val();
            if (_value && _value.length > 0) {
                const valueLiteral = selectorNameLit.val();
                const valueIdProject = selectorProject.val();
                const data = { idProject: valueIdProject, nameLiteral: valueLiteral }
                existLiteralSelectedProject(data, selectorNameLit, id);
            }
        });
    };

});

