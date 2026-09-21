import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RiskCategory, RiskStatus } from '../../domain/entities/Risk';
import { RiskForm } from './RiskForm';

describe('RiskForm', () => {
  it('muestra errores por campo y no envía si la entrada es inválida', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RiskForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El responsable es obligatorio.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía los datos normalizados cuando la entrada es válida', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RiskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Título/), 'Fuga de información');
    await user.type(screen.getByLabelText(/Responsable/), 'Dirección de TI');
    await user.selectOptions(screen.getByLabelText(/Categoría/), RiskCategory.Tecnologico);
    await user.selectOptions(screen.getByLabelText(/Probabilidad/), '4');
    await user.selectOptions(screen.getByLabelText(/Impacto/), '5');
    await user.selectOptions(screen.getByLabelText(/Estado/), RiskStatus.EnMitigacion);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Fuga de información',
        owner: 'Dirección de TI',
        category: RiskCategory.Tecnologico,
        probability: 4,
        impact: 5,
        status: RiskStatus.EnMitigacion,
      }),
    );
  });

  it('calcula el nivel en vivo a partir de probabilidad e impacto', async () => {
    const user = userEvent.setup();
    render(<RiskForm onSubmit={vi.fn()} />);

    expect(screen.getByText('Bajo')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Probabilidad/), '5');
    await user.selectOptions(screen.getByLabelText(/Impacto/), '4');

    expect(screen.getByText('Alto')).toBeInTheDocument();
    expect(screen.getByText('(20)')).toBeInTheDocument();
  });

  it('limpia el error de un campo al corregirlo', async () => {
    const user = userEvent.setup();
    render(<RiskForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Título/), 'Nuevo riesgo');
    expect(screen.queryByText('El título es obligatorio.')).not.toBeInTheDocument();
  });
});
